import { currentIPHost, currentIPPort, debugLogger } from './config.js';

// ui/bridgeAdapter.js
let defaultConnId = 'default';
let channelOpened = false;

export function sendToBridge(ws, payload, connId = defaultConnId) {
  if (!ws || typeof ws.send !== 'function') {
    debugLogger('[sendToBridge] Invalid WebSocket instance');
    return;
  }

  if (!payload) {
    debugLogger('[sendToBridge] Missing payload');
    return;
  }

  const target = { host: currentIPHost, port: currentIPPort };

  if (!channelOpened) {
    const openPacket = {
      connId,
      transportType: 'open_channel',
      target,
      source: 'bridgeAdapter',
      timestamp: Date.now(),
      lifecycleStage: 'OPEN',
      ...payload
    };
    ws.send(JSON.stringify(openPacket));
    channelOpened = true;
  };

  const sendPacket = {
    connId,
    transportType: 'frame',
    target,
    source: 'bridgeAdapter',
    timestamp: Date.now(),
    lifecycleStage: 'SEND',
    ...payload
  };

  ws.send(JSON.stringify(sendPacket));
};
