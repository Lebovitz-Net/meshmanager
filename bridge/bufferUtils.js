const DEFAULT_SKIP_KEYS = ['payload', 'data'];

export function normalizeBuffers(obj, path = [], skipKeys = DEFAULT_SKIP_KEYS, encoding = 'hex') {
  if (Buffer.isBuffer(obj)) {
    const lastKey = path[path.length - 1];
    if (skipKeys.includes(lastKey)) {
      return obj; // preserve raw buffer for decoding
    }
    return obj.toString(encoding);
  }

  if (Array.isArray(obj)) {
    return obj.map((item, i) => normalizeBuffers(item, [...path, i], skipKeys, encoding));
  }

  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
      result[key] = normalizeBuffers(obj[key], [...path, key], skipKeys, encoding);
    }
    return result;
  }

  return obj;
}
