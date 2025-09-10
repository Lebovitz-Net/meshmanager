import { useCallback,useEffect, useRef } from 'react';
import { debugLogger } from '@/utils/config.js';;

// utils/nodeEvents.js or hooks/useNodeEvents.js

const nodeListeners = new Map();

export function subscribeToNode(nodeId, handler) {
  if (!nodeListeners.has(nodeId)) {
    nodeListeners.set(nodeId, new Set());
  }
  nodeListeners.get(nodeId).add(handler);

  // Replace this with your actual transport logic
  // e.g., socket.on(`NODE_${nodeId}`, handler);
}

export function unsubscribeFromNode(nodeId, handler) {
  if (nodeListeners.has(nodeId)) {
    nodeListeners.get(nodeId).delete(handler);

    // Replace this with your actual teardown logic
    // e.g., socket.off(`NODE_${nodeId}`, handler);
  }
}

export function useNodeSubscription({ nodeId, status, active = true, send, onPacket }) {
  useEffect(() => {
    if (!active || !nodeId || typeof onPacket !== 'function') return;

    const handler = (packet) => {
      onPacket(packet);
    };

    subscribeToNode(nodeId, handler);
    return () => unsubscribeFromNode(nodeId, handler);
  }, [nodeId, active, onPacket]);
}
