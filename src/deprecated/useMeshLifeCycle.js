import { useState, useEffect, useRef } from 'react';
import { useSocketInterface } from './useSocketInterface';
import { buildWantConfigIDFrame } from '@/utils/protoHelpers.js';
// If you need binary decoding for incoming messages:
// import { decodeBinary } from '@/utils/protoHelpers.js';

export function useMeshLifecycle({
  url,
  binary = true,
  active = false,
  idleMs = 5000,
  handlers = {}
}) {
  const [protocolState, setProtocolState] = useState('init'); // init → ready
  const idleTimerRef = useRef(null);

  const {
    connect,
    close,
    send,
    addListener,
    removeListener,
    status
  } = useSocketInterface({ url, binary, active });

  // --- Transport lifecycle (from useBridgeLifecycle) ---
  useEffect(() => {
    if (!active) return;
    connect();
    return () => close();
  }, [active, connect, close]);

  // Idle timeout handling
  useEffect(() => {
    if (!active) return;
    if (idleMs <= 0) return;

    const resetIdleTimer = () => {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        console.log('[MeshLifecycle] Idle timeout — closing socket');
        close();
      }, idleMs);
    };

    // Reset on any message or send
    addListener(resetIdleTimer);
    addListener(resetIdleTimer);

    resetIdleTimer(); // start timer immediately

    return () => {
      clearTimeout(idleTimerRef.current);
      removeListener(resetIdleTimer);
      removeListener(resetIdleTimer);
    };
  }, [active, idleMs, addListener, removeListener, close]);

  // --- Protocol lifecycle (from old useMeshLifecycle) ---
  const markReady = () => setProtocolState('ready');

  const handleMessage = (data) => {
    handlers.onMessage?.(data);
    try {
      const parsed = typeof data === 'string'
        ? JSON.parse(data)
        : decodeBinary?.(data) ?? data;

      // Example: mark ready when we see a node list
      if (Array.isArray(parsed?.nodes)) {
        markReady();
      }
    } catch (err) {
      handlers.onError?.(err);
    }
  };

  useEffect(() => {
    addListener(handleMessage);
    if (handlers.onError) addListener(handlers.onError);
    if (handlers.onClose) addListener(handlers.onClose);
    return () => {
      removeListener(handleMessage);
      if (handlers.onError) removeListener(handlers.onError);
      if (handlers.onClose) removeListener(handlers.onClose);
    };
  }, [addListener, removeListener, handlers]);

  // --- Protocol-ready trigger ---
  useEffect(() => {
    if (status === 'open' && protocolState === 'ready') {
      console.log('[MeshLifecycle] Protocol ready — sending getConfig');
      send(buildWantConfigIDFrame());
      handlers.onReady?.();
    }
  }, [status, protocolState, send, handlers]);

  return {
    status,          // socket status
    protocolState,   // init / ready
    send,            // raw send
    connect,
    close,
    addListener,
    removeListener,
    markReady
  };
}
