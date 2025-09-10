import { getMessageType } from './protoDescriptor';

/**
 * Encode a protobuf payload or instance using the descriptor.
 * Supports:
 *   1. Passing a fully-created protobuf instance
 *   2. Passing a type name string + plain payload
 *
 * @param {string|object} typeOrInstance - Type name string (e.g. "meshtastic.MeshPacket") OR a protobuf instance
 * @param {object} [payload] - Plain JS object (only used if first arg is a type name)
 * @returns {Uint8Array|null}
 */
function encodeProtobuf(typeOrInstance, payload) {
  try {
    // Case 1: Already a protobuf message instance
    if (typeOrInstance && typeof typeOrInstance === 'object' && typeOrInstance.$type) {
      return typeOrInstance.$type.encode(typeOrInstance).finish();
    }

    // Case 2: Type name string + payload
    if (typeof typeOrInstance === 'string') {
      const Message = getMessageType(typeOrInstance);
      if (!Message) return null;

      const err = Message.verify(payload);
      if (err) {
        console.warn(`⚠️ Invalid payload for ${typeOrInstance}:`, err);
        return null;
      }

      const message = Message.create(payload);
      return Message.encode(message).finish();
    }

    throw new Error('encodeProtobuf() expected a protobuf instance or type name string');
  } catch (err) {
    console.error('❌ encodeProtobuf failed:', err);
    return null;
  }
}

/**
 * Decode a protobuf buffer using the descriptor.
 * @param {string} typeName - e.g. "meshtastic.MeshPacket"
 * @param {Uint8Array|Buffer} buffer
 * @returns {object|null}
 */
function decodeProtobuf(typeName, buffer) {
  const Message = getMessageType(typeName);
  if (!Message) return null;

  try {
    const decoded = Message.decode(buffer);
    return Message.toObject(decoded, {
      enums: String,
      longs: String,
      defaults: true,
      oneofs: true,
    });
  } catch (err) {
    console.error(`❌ Failed to decode ${typeName}:`, err);
    return null;
  }
}

export { encodeProtobuf, decodeProtobuf };
