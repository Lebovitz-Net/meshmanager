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

export function parsePlainMessage(buffer) {
  try {
    return buffer.toString('utf-8');
  } catch (err) {
    console.warn('[parsePlainMessage] Failed to parse buffer:', err);
    return null;
  }
}

export function extractChannelInfo(packet) {
  const channel_id = packet?.decoded?.channel_id ?? packet?.channel?.id ?? null;
  return channel_id ? { channel_id } : null;
}
