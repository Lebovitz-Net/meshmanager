// bridge/tcpHandler.js
import net from 'net';

const START1 = 0x94;
const START2 = 0xC3;

/**
 * Creates a TCP handler instance for a given connection ID.
 * @param {string} connId - Unique ID for this TCP connection (assigned by WS handler)
 * @param {string} host - Target host
 * @param {number} port - Target port
 * @param {object} handlers - Event callbacks
 */
export default function createTCPHandler(connId, host, port, handlers = {}) {
  const {
    onConnect = () => {},
    onFrame = () => {},
    onError = () => {},
    onClose = () => {},
    onTimeout = () => {},
    onDrain = () => {},
    onEnd = () => {}
  } = handlers;

  const socket = new net.Socket();
  let buffer = Buffer.alloc(0);
  let connected = false;

  // Connect
  socket.connect(port, host, () => {
    connected = true;
    onConnect(connId);
  });

  // Frame parser
  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= 4) {
      if (buffer[0] !== START1 || buffer[1] !== START2) {
        console.log(`[TCP ${connId}] desync, skipping byte`);
        buffer = buffer.subarray(1);
        continue;
      }

      const frameLength = buffer.readUInt16BE(2);
      const totalLength = 4 + frameLength;

      if (frameLength < 1 || frameLength > 4096 || buffer.length < totalLength) {
        console.debug(`[TCP ${connId}] incomplete or invalid frame len=${frameLength}, bufLen=${buffer.length}`);
        break;
      }

      const rawFrame = new Uint8Array(buffer).slice(0, totalLength);
      const frame = Buffer.from(rawFrame);
      buffer = buffer.subarray(totalLength);

      try {
        onFrame(connId, frame);
      } catch (err) {
        console.warn(`❌ [TCP ${connId}] Frame handler error:`, err);
      }
    }
  });

  // Lifecycle events
  socket.on('error', (err) => {
    connected = false;
    onError(connId, err);
  });

  socket.on('close', (hadError) => {
    connected = false;
    onClose(connId, hadError);
  });

  socket.on('timeout', () => {
    connected = false;
    onTimeout(connId);
  });

  socket.on('drain', () => onDrain(connId));

  socket.on('end', () => {
    connected = false;
    onEnd(connId);
  });

  return {
    connId,
    write: (data) => {
      const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
      console.log(`[TCP ${connId}] SEND ${buf.length} bytes`);
      socket.write(buf);
    },
    end: () => socket.end(),
    isConnected: () => connected,
    socket
  };
}
