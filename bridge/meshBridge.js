// bridge/meshBridge.js
import { publishToMQTT } from './mqttBridge.js';

function normalizeForUI(packet) {
  const base = {
    type: packet.type,
    nodeId: packet.nodeId || 'UnknownNode',
    viaMqtt: !!packet.viaMqtt,
    payload: {}
  };

  if (packet.type === 'NodeInfo' && packet.decoded?.user) {
    const user = packet.decoded.user;
    base.payload.longName = user.longName || 'Unnamed Node';
    base.payload.shortName = user.shortName || '';
    base.payload.channel = packet.decoded.channel || null;
    base.payload.status = mapStatusEnum(packet.decoded.status);
    base.payload.lastHeard = packet.decoded.lastHeard
      ? packet.decoded.lastHeard * 1000 // seconds → ms
      : null;
    base.payload.hopsAway = packet.decoded.hopsAway ?? null;
  }

  // You can add similar blocks for Telemetry, Position, etc.
  return base;
}

function mapStatusEnum(value) {
  const map = { 0: 'open', 1: 'closed' };
  return map[value] || 'unknown';
}


let activeSession = null;

export function setActiveSession(session) {
  activeSession = session;
}

function broadcastToWebSocketClients(packet) {
  if (!activeSession?.ws) {
    console.warn('[MeshBridge] No active WebSocket session — skipping broadcast');
    return;
  }

  if (activeSession.ws.readyState !== activeSession.ws.OPEN) {
    console.warn('[MeshBridge] WebSocket not open — skipping broadcast');
    return;
  }

  try {
    activeSession.ws.send(JSON.stringify(packet));
    console.log("[meshBridge] TCP -> WS");
  } catch (err) {
    console.error('[MeshBridge] Failed to send packet to WS client:', err.message);
  }
}


export function processLocalPacket(packet) {
  const normalized = normalizeForUI(packet);
  console.log('[MeshBridge] → React:', normalized.type, normalized);
  broadcastToWebSocketClients(normalized);
}
