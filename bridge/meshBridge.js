// bridge/meshBridge.js
import { publishToMQTT } from './mqttBridge.js';

let activeSession = null;

export function setActiveSession(session) {
  activeSession = session;
}

function broadcastToWebSocketClients(packet) {
  if (activeSession?.ws?.readyState === activeSession.ws.OPEN) {
    activeSession.ws.send(JSON.stringify(packet));
  }
}

export function processLocalPacket(packet) {
  console.log(`[MeshBridge] ${packet.type} from ${packet.nodeId}`);
  broadcastToWebSocketClients({
    type: packet.type,
    nodeId: packet.nodeId,
    payload: packet.decoded
  });
  publishToMQTT(packet);
}
