import { useRef } from 'react';
import { debugLogger } from '@/utils/config.js';

export function useSocketInterface({ url, binary = true }) {
  const socketRef = useRef(null);
  const listenersRef = useRef(new Set());

  const connect = () => {
    if (socketRef.current) return;
    const ws = new WebSocket(url);
    ws.binaryType = binary ? 'arraybuffer' : 'blob';

    ws.onopen = () => console.log('[SocketInterface] Connected');
    ws.onclose = () => console.log('[SocketInterface] Closed');
    ws.onerror = (e) => {
        console.warn('[useSocketInterface] ws.onerror triggered:', e);

        const errorInfo = {
            type: e?.type || 'error',
            message: 'WebSocket error occurred',
            raw: e
        };

        console.log('[useSocketInterface] Error listeners count:', listenersRef.current.size);
        listenersRef.current.forEach((fn, i) => {
            console.log(`[useSocketInterface] Invoking listener ${i}:`, fn.name || 'anonymous');
            fn(errorInfo);
        });
    };
    ws.onmessage = (e) => {
        const data = binary ? new Uint8Array(e.data) : e.data;
        listenersRef.current.forEach((fn) => fn(data));
    };

    socketRef.current = ws;
  };

  const send = (data) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(data);
    }
  };

  const close = () => {
    socketRef.current?.close();
    socketRef.current = null;
  };

  const addListener = (fn) => {
    const label =
      fn.name ||
      fn.displayName ||
      (fn.constructor?.name === 'Function' ? 'anonymous' : fn.constructor?.name);
      if (listenersRef.current.size === 0) {
        listenersRef.current.clear;
        listenersRef.current.add(fn);
      };
  };
  const removeListener = (fn) => listenersRef.current.delete(fn);

  return { connect, send, close, addListener, removeListener };
}
