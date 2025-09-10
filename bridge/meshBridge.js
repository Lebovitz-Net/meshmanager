// bridge/meshBridge.js

import createWSServer from './wsServer.js';
import createTCPClient from './tcpClient.js';
import { currentIPHost, currentIPPort } from '../src/utils/config.js';
import { randomUUID } from 'crypto';
import { publishToMQTT } from './mqttBridge.js';
import {
  initProtoTypes,
  classifyPacket,
  stripFramingHeader,
} from '../src/utils/packetDecoders.js';

const WS_PORT = 8080;
let activeSession = null;

async function startBridge() {
  await initProtoTypes();
  console.log('[Startup] Protobuf types initialized');
}

startBridge().catch(err => {
  console.error('[Startup] Bridge failed to start:', err);
});

function broadcastToWebSocketClients(packet) {
  if (activeSession?.ws?.readyState === activeSession.ws.OPEN) {
    activeSession.ws.send(JSON.stringify(packet));
  }
}

export function handleDecodedPacket(packet) {
  if (!packet?.decoded || packet.type === 'Unknown') {
    console.warn('[Bridge] Skipping malformed or unknown packet');
    return;
  }

  const nodeId = packet.decoded?.nodeId || packet.decoded?.from || packet.decoded?.owner || 'UnknownNode';
  console.log(`[Bridge] Decoded ${packet.type} from node ${nodeId}`);

  broadcastToWebSocketClients({
    type: packet.type,
    nodeId,
    payload: packet.decoded,
  });

  publishToMQTT({
    type: packet.type,
    nodeId,
    payload: packet.decoded,
  });
}

createWSServer(WS_PORT, (ws) => {
  if (activeSession) {
    ws.close(1013, 'Another session is active');
    return;
  }

  ws.id = randomUUID();
  console.log(`🌐 WS handshake — ID: ${ws.id}`);

  const tcp = createTCPClient(currentIPHost, currentIPPort, {
    onConnect: () => console.log(`✅ TCP connected for WS ${ws.id}`),

    onFrame: (buffer) => {
      const cleanBuffer = stripFramingHeader(buffer);
      const result = classifyPacket(cleanBuffer);

      console.log(`[Bridge] Received packet type: ${result.type}`);

      switch (result.type) {
        case 'MeshPacket':
        case 'FromRadio':
        case 'ToRadio':
        case 'ServiceEnvelope':
        case 'NodeInfo':
        case 'Telemetry':
        case 'Config':
        case 'DeviceMetrics':
          handleDecodedPacket(result);
          break;

        case 'Unknown':
          console.warn('[Bridge] Unrecognized packet format');
          console.log('Raw buffer:', cleanBuffer.toString('hex'));
          break;

        default:
          console.warn('[Bridge] Unexpected classification:', result.type);
          break;
      }
    },

    onError: (err) => {
      console.error(`❌ TCP error:`, err.message);
      ws.close(1011, 'TCP error');
      activeSession = null;
    },

    onClose: () => {
      ws.close(1000, 'TCP closed');
      activeSession = null;
    },

    onTimeout: () => {
      ws.close(1011, 'TCP timeout');
      activeSession = null;
    },

    onDrain: () => console.log(`💧 TCP write buffer drained`),

    onEnd: () => {
      ws.close(1000, 'TCP remote end');
      activeSession = null;
    }
  });

  activeSession = { ws, tcp };

  ws.on('message', (msg) => {
    tcp.write(msg);
    console.log(`📤 WS → TCP [${ws.id}] (${msg.length} bytes)`);
  });

  ws.on('close', () => {
    tcp.end();
    activeSession = null;
    console.log(`🛑 WS disconnected — ID: ${ws.id}`);
  });
});
