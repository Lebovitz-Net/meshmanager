const eventListeners = new Map(); // key → Map<eventType, Set<handlers>>

export function addListener(key, eventType, handler) {
  if (!eventListeners.has(key)) {
    eventListeners.set(key, new Map());
  }
  const typeMap = eventListeners.get(key);
  if (!typeMap.has(eventType)) {
    typeMap.set(eventType, new Set());
  }
  typeMap.get(eventType).add(handler);
}

export function removeListener(key, eventType, handler) {
  const typeMap = eventListeners.get(key);
  if (!typeMap) return;

  const handlers = typeMap.get(eventType);
  if (!handlers) return;

  handlers.delete(handler);
  if (handlers.size === 0) {
    typeMap.delete(eventType);
  }
  if (typeMap.size === 0) {
    eventListeners.delete(key);
  }
}

export function callHandler(key, eventType, payload) {
  const typeMap = eventListeners.get(key);
  if (!typeMap) return;

  const handlers = typeMap.get(eventType);
  if (!handlers) return;

  handlers.forEach((fn) => {
    try {
      fn(payload);
    } catch (err) {
      console.warn(`[eventUtils] ${eventType} handler for ${key} threw:`, err);
    }
  });
}

export function emit(key, eventType, payload) {
  callHandler(key, eventType, payload);
}

export function createListenerBridge(ref, key) {
  ref.current = {
    add: (type, fn) => addListener(key, type, fn),
    remove: (type, fn) => removeListener(key, type, fn),
    call: (type, payload) => callHandler(key, type, payload),
    emit: (type, payload) => emit(key, type, payload)
  };
}
