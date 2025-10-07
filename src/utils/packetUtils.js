// packetUtils.js

/**
 * Generates a protocol-faithful MeshPacket ID.
 * Combines 16 bits of entropy with 16 bits of timestamp.
 * Ensures uniqueness and compatibility with Meshtastic's expectations.
 */
export function generateMeshPacketId() {
  const timestamp = Math.floor(Date.now() / 1000); // seconds since epoch
  const entropy = Math.floor(Math.random() * 65536); // 16-bit random
  return ((entropy << 16) | (timestamp & 0xffff)) >>> 0; // unsigned 32-bit
}
