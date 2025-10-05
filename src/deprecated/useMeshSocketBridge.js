import { useState, useEffect, useRef } from 'react';
import { useSocketInterface } from '@/hooks/useSocketInterface';
import { getWSUrl } from '@/utils/config.js';
import { buildWantConfigIDFrame } from '@/utils/protoHelpers.js';
import { addListener, removeListener, emit } from '@/utils/eventUtils';

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
  const idleTimerRef = useRef(null);

  const {
    connect,
    protocolState,
    setProtocolState,
    close,
    send,
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
  // useEffect(() => {
  //   if (!active || idleMs <= 0) return;

  //   const resetIdleTimer = () => {
  //     clearTimeout(idleTimerRef.current);
  //     idleTimerRef.current = setTimeout(() => {
  //       console.log('[MeshSocketBridge] Idle timeout — closing socket');
  //       close();
  //     }, idleMs);
  //   };

  //   addListener('socket', 'message', resetIdleTimer);
  //   resetIdleTimer();

  //   return () => {
  //     clearTimeout(idleTimerRef.current);
  //     removeListener('socket', 'message', resetIdleTimer);
  //   };
  // }, [active, idleMs, addListener, removeListener, close]);

  // Protocol message handling — decode once, emit typed events
  const handleRawMessage = (data) => {
    try {
      // Pass parsed object to external handler if provided
      handlers.onMessage?.(data);

      // Emit typed event for downstream consumers
      const type = classifyMessage(data);
      console.log('[MeshSocketBridge] Emitting typed message:', type, data);
      emit('socket', type, data);
    }
    catch (err) {
      emit('socket', 'error', err);;
    };
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
    if (protocolState === 'ready') {
      console.log('[MeshSocketBridge] Protocol ready — sending getConfig', protocolState);
      send(buildWantConfigIDFrame());
      handlers.onReady?.();
    } else {
      console.log('[MeshSocketBridge] Not ready yet', { protocolState });
    }
  }, [ protocolState, send, handlers]);

  // Manual trigger for getConfig
  const sendRequest = () => {
    if (protocolState !== 'ready') {
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
    protocolState,
    send,
    connect,
    close,
    sendRequest
  };
}
