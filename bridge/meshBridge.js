// bridge/meshBridge.js

/**
 * === Single-session mode (legacy) ===
 * Keeps compatibility with the old bridge design where only one WS client existed.
 */
let ws = null;

/**
 * Set the single active WebSocket client (legacy mode).
 * Called by webSocketHandler when a WS client connects.
 */
export function setWebSocketClient(wsClient) {
  ws = wsClient;
}

/**
 * Send a packet to the single WS client (legacy mode).
 */
function broadcastToWebSocketClient(connId, packet) {
  if (!ws || ws.readyState !== ws.OPEN) return;
  try {
    ws.send(JSON.stringify(packet));
    console.log(`[meshBridge] TCP(${connId}) → WS`);
  } catch (err) {
    console.error('[MeshBridge] WS send error:', err.message);
  }
}

/**
 * Process a decoded packet from a local source (TCP, MQTT, etc.) in legacy mode.
 */
export function processLocalPacket(connId, packet) {
  if (packet?.type !== 'FromRadio') return;
  const userId = packet?.nodeInfo?.user?.id;
  if (!userId) return;
  broadcastToWebSocketClient(connId, packet);
}

/* ------------------------------------------------------------------------- */

/**
 * === Multi-session mode (new architecture) ===
 * Supports multiple WS clients, each with its own sessionId.
 */
let activeSessions = new Map();

/**
 * Replace the current active sessions map with a new one.
 * @param {Map<string, { ws: WebSocket, meta?: any }>} sessions
 */
export function setActiveSessions(sessions) {
  if (!(sessions instanceof Map)) {
    throw new Error('setActiveSessions expects a Map of sessionId -> { ws, meta }');
  }
  activeSessions = sessions;
}

export function getActiveSessions() {
  return activeSessions;
};

/**
 * Send a packet to a specific WS session by ID.
 */
function sendToSession(sessionId, packet) {
  const session = activeSessions.get(sessionId);
  if (!session?.ws || session.ws.readyState !== session.ws.OPEN) return;
  try {
    session.ws.send(JSON.stringify(packet));
    console.log(`[meshBridge] Sent to WS session ${sessionId}`);
  } catch (err) {
    console.error(`[meshBridge] WS send error to ${sessionId}:`, err.message);
  }
}

/**
 * Broadcast a packet to all active WS sessions.
 */
function broadcastToAllSessions(packet) {
  for (const [sessionId, { ws }] of activeSessions.entries()) {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(JSON.stringify(packet));
      } catch (err) {
        console.error(`[meshBridge] WS send error to ${sessionId}:`, err.message);
      }
    }
  }
}

/**
 * Process a decoded packet from a local source (TCP, MQTT, etc.) in multi-session mode.
 * @param {string} connId - The connection/channel ID
 * @param {object} packet - The decoded packet object
 * @param {string} [targetSessionId] - Optional: send only to a specific WS session
 */
export function processLocalPacketMulti(packet, targetSessionId) {
  if (packet?.type !== 'FromRadio') return;
  const userId = packet?.nodeInfo?.user?.id;
  if (!userId) return;

  if (targetSessionId) {
    sendToSession(targetSessionId, packet);
  } else {
    broadcastToAllSessions(packet);
  }
}

