// bridge/tcpClient.js
import net from 'net';

const START1 = 0x94;
const START2 = 0xC3;

export default function createTCPClient(host, port, handlers = {}) {
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

  socket.connect(port, host, onConnect);

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);


    while (buffer.length >= 4) {
      if (buffer[0] !== START1 || buffer[1] !== START2) {
        console.log("[TCP] continue len", buffer.len);
        buffer = buffer.subarray(1); // avoids deprecated slice
        continue;
      }

      const frameLength = buffer.readUInt16BE(2);
      const totalLength = 4 + frameLength;

      if (frameLength < 1 || frameLength > 4096 || buffer.length < totalLength) {
        console.debug("[TCP] rejecting frame len", frameLength, buffer.length);
        break;
      }

      // ✅ Copy slice safely using Uint8Array
      const rawFrame = new Uint8Array(buffer).slice(0, totalLength); // includes header
      const frame = Buffer.from(rawFrame);
      buffer = buffer.subarray(totalLength);

      try {
        onFrame(frame);
      } catch (err) {
        console.warn(`❌ Frame handler error:`, err);
      }
    }
  });

  socket.on('error', onError);
  socket.on('close', onClose);
  socket.on('timeout', onTimeout);
  socket.on('drain', onDrain);
  socket.on('end', onEnd);

  return {
    write: (data) => {
      const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
      socket.write(buf);
    },
    end: () => socket.end(),
    socket
  };
}
