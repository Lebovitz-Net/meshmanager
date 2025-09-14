const nodeListeners = new Map();

export function nodeAddListener(nodeId, eventType, handler) {
  if (!nodeListeners.has(nodeId)) {
    nodeListeners.set(nodeId, new Map());
  }
  const typeMap = nodeListeners.get(nodeId);
  if (!typeMap.has(eventType)) {
    typeMap.set(eventType, new Set());
  }
  typeMap.get(eventType).add(handler);
}

export function nodeRemoveListener(nodeId, eventType, handler) {
  const typeMap = nodeListeners.get(nodeId);
  if (!typeMap) return;

  const handlers = typeMap.get(eventType);
  if (!handlers) return;

  handlers.delete(handler);
  if (handlers.size === 0) {
    typeMap.delete(eventType);
  }
  if (typeMap.size === 0) {
    nodeListeners.delete(nodeId);
  }
}

export function nodeCallHandler(nodeId, eventType, packet) {
  const typeMap = nodeListeners.get(nodeId);
  if (!typeMap) return;

  const handlers = typeMap.get(eventType);
  if (!handlers) return;

  handlers.forEach((fn) => {
    try {
      fn(packet);
    } catch (err) {
      console.warn(`[NodeEvents] ${eventType} handler for ${nodeId} threw:`, err);
    }
  });
}

export function subscribeToNode(nodeId, handler) {
  if (!nodeListeners.has(nodeId)) {
    nodeListeners.set(nodeId, new Set());
  }
  nodeListeners.get(nodeId).add(handler);
}

export function unsubscribeFromNode(nodeId, handler) {
  if (nodeListeners.has(nodeId)) {
    nodeListeners.get(nodeId).delete(handler);
    if (nodeListeners.get(nodeId).size === 0) {
      nodeListeners.delete(nodeId);
    }
  }
}

export function routePacketToSubscribers(nodeId, packet) {
  const listeners = nodeListeners.get(nodeId);
  if (!listeners) return;

  listeners.forEach((fn) => {
    try {
      fn(packet);
    } catch (err) {
      console.warn(`[NodeEvents] Listener for ${nodeId} threw:`, err);
    }
  });
}

export function useNodeSubscription({ nodeId, active = true, onPacket }) {
  useEffect(() => {
    if (!active || !nodeId || typeof onPacket !== 'function') return;

    subscribeToNode(nodeId, onPacket);
    return () => unsubscribeFromNode(nodeId, onPacket);
  }, [nodeId, active, onPacket]);
}
