import { useEffect } from 'react';

// src/hooks/useSse.js

const handlers = new Map();

let source = null;

function initSSE() {
  if (source) return; // Prevent multiple connections

  source = new EventSource(`${import.meta.env.VITE_API_BASE}/sse/events`);

source.onmessage = (event) => {
  let parsed;
  try {
    parsed = JSON.parse(event.data);
  } catch (err) {
    console.warn('[SSE] Non-JSON event:', event.data);
    return;
  }

  const { type } = parsed;
  const typeHandlers = handlers.get(type);
  if (typeHandlers) {
    typeHandlers.forEach((cb) => cb(parsed));
  } else {
    console.log('[SSE] No handler for type:', type);
  }
};

  source.onerror = (err) => {
    console.error('[SSE] Connection error:', err);
    source.close();
    source = null;
    setTimeout(initSSE, 3000); // Retry after 3s
  };
}
function registerHandler(type, callback) {
  if (!handlers.has(type)) {
    handlers.set(type, new Set());
  }
  handlers.get(type).add(callback);
}

function unregisterHandler(type, callback) {
  if (handlers.has(type)) {
    handlers.get(type).delete(callback);
    if (handlers.get(type).size === 0) {
      handlers.delete(type);
    }
  }
}

export default function useSSE(type, callback) {
  useEffect(() => {
    initSSE();
    registerHandler(type, callback);
    return () => unregisterHandler(type, callback);
  }, [type, callback]);
}
