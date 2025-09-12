import createWSServer from './wsServer.js';
import createTCPClient from './tcpClient.js';
import { currentIPHost, currentIPPort } from '../src/utils/config.js';
import { randomUUID } from 'crypto';
import { decodeAndNormalize } from './packetDecoders.js';
import { processLocalPacket, setActiveSession } from './meshBridge.js';

const WS_PORT = 8080;
let activeSession = null;

export default function startWebSocketHandler() {
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
        const packet = decodeAndNormalize(buffer, 'tcp');
        if (!packet || packet.type === 'Unknown') return;
        processLocalPacket(packet);
      },

      onError: (err) => {
        console.error('❌ TCP error:', err.message);
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

      onDrain: () => console.log('💧 TCP write buffer drained'),

      onEnd: () => {
        ws.close(1000, 'TCP remote end');
        activeSession = null;
      }
    });

    activeSession = { ws, tcp };
    setActiveSession(activeSession);

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
}
