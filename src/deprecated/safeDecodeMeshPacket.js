import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Proto = require('../proto.cjs');


export function safeDecodeMeshPacket(buffer) {
  if (!(buffer instanceof Uint8Array)) {
    console.warn('Invalid buffer type:', typeof buffer);
    return null;
  }

  try {
    const decoded = Proto.meshtastic.MeshPacket.decode(buffer);
    return decoded;
  } catch (err) {
    console.warn('Decode failed:', err);
    return null;
  }
}
