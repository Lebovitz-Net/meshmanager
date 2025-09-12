/**
 * Recursively normalizes Buffer fields in an object,
 * converting them to hex strings unless they're named 'payload' or 'data'.
 * Safe for decoded protobuf packets.
 */

const SKIP_KEYS = ['payload', 'data'];

export function normalizeBuffers(obj, path = []) {
  if (Buffer.isBuffer(obj)) {
    const keyPath = path.join('.');
    const lastKey = path[path.length - 1];
    if (SKIP_KEYS.includes(lastKey)) {
      return obj; // preserve raw buffer for decoding
    }
    return obj.toString('hex');
  }

  if (Array.isArray(obj)) {
    return obj.map((item, i) => normalizeBuffers(item, [...path, i]));
  }

  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
        result[key] = normalizeBuffers(obj[key], [...path, key]);
    }
    return result;
  }
  return obj;
}
