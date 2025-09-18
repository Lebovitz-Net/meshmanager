// bridge/websocketHandler.js
import createTCPHandler from './tcpHandler.js';
import { currentIPHost, currentIPPort } from '../src/utils/config.js';
import { decodeAndNormalize } from './packetDecoders.js';
import { processLocalPacketMulti, getActiveSessions, setActiveSessions } from './meshBridge.js';

export default function createWebsocketHandler() {
  const sessions = new Map();
  setActiveSessions(sessions);

  return {
    connect(ws, ctx) {
      const tcpConnections = new Map();
      sessions.set(ctx.id, { ws, tcpConnections });

      function isPlainObject(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
      };


      function sendWS(transportType, packet) {
        if (!isPlainObject(packet)) return;

        for (const [sessionId, { ws }] of getActiveSessions().entries()) {
          if (ws.readyState === ws.OPEN) {
            try {
              const enriched = { ...packet, transportType };
              ws.send(JSON.stringify(enriched));
            } catch (err) {
              console.error(`[meshBridge] WS send error to ${sessionId}:`, err.message);
            }
          }
        }
      }

      const openTCPConnection = (connId, host, port) => {
        sendWS('channel_status', { connId, status: 'connecting' });

        const tcp = createTCPHandler(connId, host, port, {
          onConnect: (id) => sendWS('channel_status', { connId, status: 'ready' }),
          onFrame: (id, buffer) => {
            const packet = decodeAndNormalize(buffer, 'tcp', id);
            if (!packet || packet.type === 'Unknown') return;
            sendWS('frame', packet);
            processLocalPacketMulti(packet);
          },
          onError: (id, err) => {
            sendWS('channel_status', { connId, status: 'error', detail: err.message });
            scheduleReconnect(connId, host, port);
          },
          onClose: (id) => {
            sendWS('channel_status', { connId, status: 'disconnected' });
            scheduleReconnect(connId, host, port);
          },
          onTimeout: (id) => {
            sendWS('channel_status', { connId, status: 'timeout' });
            scheduleReconnect(connId, host, port);
          },
          onEnd: (id) => {
            sendWS('channel_status', { connId, status: 'remote_end' });
            scheduleReconnect(connId, host, port);
          }
        });

        tcpConnections.set(connId, { tcp, host, port, reconnectTimer: null });
      };

      const scheduleReconnect = (connId, host, port) => {
        const entry = tcpConnections.get(connId);
        if (!entry || entry.reconnectTimer) return;
        entry.reconnectTimer = setTimeout(() => {
          entry.reconnectTimer = null;
          openTCPConnection(connId, host, port);
        }, 3000);
      };

      ws.on('message', (msg) => {
        try {
          const packet = JSON.parse(msg);
          const { transportType, connId, target } = packet;

          if (transportType === 'open_channel') {
            const id = connId || ctx.id;
            openTCPConnection(id, target?.host || currentIPHost, target?.port || currentIPPort);
            return;
          }

          if (transportType === 'close_channel' && tcpConnections.has(connId)) {
            tcpConnections.get(connId).tcp.end();
            tcpConnections.delete(connId);
            sendWS('channel_status', { connId, status: 'closed' });
            return;
          }

          if (transportType === 'frame' && tcpConnections.has(connId)) {
            const objToArray = (obj) => Object.keys(obj).map((key) => obj[key]);
            tcpConnections.get(connId).tcp.write(objToArray(packet));
            return;
          }

        } catch (err) {
          console.error('Invalid WS message', err);
        }

      });

      ws.on('close', () => {
        tcpConnections.forEach(({ tcp, reconnectTimer }) => {
          if (reconnectTimer) clearTimeout(reconnectTimer);
          tcp.end();
        });
        tcpConnections.clear();
        sessions.delete(ctx.id);
        setActiveSessions(sessions);
      });
    }
  };
}
