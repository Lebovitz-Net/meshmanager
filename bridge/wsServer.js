// bridge/wsServer.js
import { WebSocketServer } from 'ws';

export default function createWSServer(port, onConnect) {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws) => {
    onConnect(ws);
  });

  console.log(`🌐 WebSocket server listening on port ${port}`);
}
