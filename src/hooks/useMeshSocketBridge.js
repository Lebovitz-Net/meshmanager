import { useState, useEffect, useRef } from 'react';
import { useSocketInterface } from '@/hooks/useSocketInterface';
import { getWSUrl } from '@/utils/config.js';
import { buildWantConfigIDFrame } from '@/utils/protoHelpers.js';
import { decodeFrame } from '@/utils/decodeFrame.js';
import { addListener, removeListener } from '@/utils/eventUtils';

// Utility to classify parsed messages
function classifyMessage(parsed) {
  if (parsed?.type) return parsed.type;
  if (Array.isArray(parsed?.nodes)) return 'nodeInfo';
  return 'unknown';
}

export function useMeshSocketBridge({
  active = true,
  idleMs = 10000,
  binary = true,
  handlers = {}
}) {
  const [protocolState, setProtocolState] = useState('init'); // init → ready
  const idleTimerRef = useRef(null);

  const {
    connect,
    close,
    send,
    status,
  } = useSocketInterface({
    url: getWSUrl(),
    binary,
    active
  });

  // Auto-connect/disconnect
  useEffect(() => {
    if (active) connect();
    else close();
  }, [active, connect, close]);

  // Idle timeout handling — reset on any message
  useEffect(() => {
    if (!active || idleMs <= 0) return;

    const resetIdleTimer = () => {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        console.log('[MeshSocketBridge] Idle timeout — closing socket');
        close();
      }, idleMs);
    };

    addListener('socket', 'message', resetIdleTimer);
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimerRef.current);
      removeListener('socket', 'message', resetIdleTimer);
    };
  }, [active, idleMs, addListener, removeListener, close]);

  // Protocol message handling — decode once, emit typed events
  const handleRawMessage = (data) => {
    try {
      let parsed;
      if (typeof data === 'string') {
        parsed = JSON.parse(data);
      } else if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
        parsed = decodeFrame(data);
      } else if (typeof data === 'object' && data !== null) {
        console.log('[Skipping object]', data);
        return;
      } else {
        console.warn('[Unknown incoming type]', data);
        return;
      }

      // Pass parsed object to external handler if provided
      handlers.onMessage?.(parsed);

      // Update protocol state if we detect node info
      if (Array.isArray(parsed?.nodes)) {
        setProtocolState('ready');
      }

      // Emit typed event for downstream consumers
      const type = classifyMessage(parsed);
      emit('socket', type, parsed);

    } catch (err) {
      handlers.onError?.(err);
    }
  };

  // Subscribe to raw socket messages
  useEffect(() => {
    const handleOpen = () => {
      console.log('[MeshSocketBridge] Connection opened — protocol ready');
      setProtocolState('ready');
      handlers.onReady?.();
    };

    addListener('socket', 'open', handleOpen);
    return () => removeListener('socket', 'open', handleOpen);
  }, [addListener, removeListener, handlers]);


useEffect(() => {
  addListener('socket', 'message', handleRawMessage);
  if (handlers.onError) addListener('socket', 'error', handlers.onError);
  if (handlers.onClose) addListener('socket', 'close', handlers.onClose);

  return () => {
    removeListener('socket', 'message', handleRawMessage);
    if (handlers.onError) removeListener('socket', 'error', handlers.onError);
    if (handlers.onClose) removeListener('socket', 'close', handlers.onClose);
  };
}, [handlers, handleRawMessage]);


  // Protocol-ready trigger
  useEffect(() => {
    if (status === 'open' && protocolState === 'ready') {
      console.log('[MeshSocketBridge] Protocol ready — sending getConfig', status, protocolState);
      send(buildWantConfigIDFrame());
      handlers.onReady?.();
    } else {
      console.log('[MeshSocketBridge] Not ready yet', { status, protocolState });
    }
  }, [status, protocolState, send, handlers]);

  // Manual trigger for getConfig
  const sendRequest = () => {
    if (status !== 'open') {
      console.warn('[MeshSocketBridge] Skipping send — socket not open');
      return;
    }
    const frame = buildWantConfigIDFrame();
    console.log('[MeshSocketBridge] Sending getConfig frame:', frame);
    send(frame);
  };

  useEffect(() => {
  if (protocolState === 'ready') {
    console.log('[MeshSocketBridge] Protocol ready — sending getConfig');
    sendRequest();
  }
}, [protocolState, sendRequest]);

  return {
    status,
    protocolState,
    send,
    connect,
    close,
    sendRequest
  };
}
