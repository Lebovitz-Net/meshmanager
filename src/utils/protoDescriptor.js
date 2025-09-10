// useProtoDescriptor.js
// Loads and exposes the protobuf Root from precompiled proto.json
// Dry-run safe, override-friendly, and ready for onboarding

import descriptor from '@/assets/proto.json' with { type: 'json' };
import protobuf from 'protobufjs';

let root;

try {
  root = protobuf.Root.fromJSON(descriptor);
} catch (err) {
  console.error('❌ Failed to load proto descriptor:', err);
  root = null;
}

/**
 * Lookup a protobuf message type safely.
 * @param {string} typeName - Fully qualified message name (e.g. "meshtastic.MeshPacket")
 * @returns {protobuf.Type|null}
 */
export function getMessageType(typeName) {
  if (!root) return null;
  const type = root.lookupType(typeName);
  if (!type) {
    console.warn(`⚠️ Message type "${typeName}" not found in descriptor`);
    return null;
  }
  return type;
}

/**
 * Expose the root for advanced use (e.g. lookupEnum, decode raw packets)
 */
export { root };
