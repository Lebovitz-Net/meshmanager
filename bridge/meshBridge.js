let activeSession = null;

export function setActiveSession(session) {
  activeSession = session;
}

function broadcastToWebSocketClients(packet) {
  if (!activeSession?.ws || activeSession.ws.readyState !== activeSession.ws.OPEN) return;
  try {
    activeSession.ws.send(JSON.stringify(packet));
    console.log('[meshBridge] TCP → WS');
  } catch (err) {
    console.error('[MeshBridge] WS send error:', err.message);
  }
}

export function processLocalPacket(packet) {
  if (packet?.type !== 'FromRadio') return;

  const userId = packet?.nodeInfo?.user?.id;
  if (!userId) return;
   console.log(`[meshBridge] Packet`, packet);
  broadcastToWebSocketClients(packet);
}

