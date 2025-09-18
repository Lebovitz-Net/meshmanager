// bridge/wsServer.js
import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';
import createWebsocketHandler from './websocketHandler.js';

export default function createWSServer({ port = 8080 }) {
  const wss = new WebSocketServer({ port });
  const handler = createWebsocketHandler();

  wss.on('connection', (ws, req) => {
    const ctx = {
      id: randomUUID(),
      ip: req.socket?.remoteAddress,
      ua: req.headers['user-agent']
    };

    if (handler && typeof handler.connect === 'function') {
      handler.connect(ws, ctx);
    }
  });

  wss.on('listening', () => {
    console.log(`🌐 WebSocket server listening on port ${port}`);
  });

  wss.on('error', (err) => {
    console.error('[WS Server] Error:', err.message);
  });

  return wss;
}
