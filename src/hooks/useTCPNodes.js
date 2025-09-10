import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildWantConfigIDFrame } from '@/utils/protoHelpers.js';
import { useMeshSocketBridge } from '@/hooks/useMeshSocketBridge.js';
import { debugLogger } from '@/utils/config.js';

const WS_URL = import.meta?.env?.VITE_TCP_BRIDGE_URL || 'ws://localhost:8080';

// Retry settings
const TIMEOUT_MS = 3000; // 3 seconds before retry
const MAX_RETRIES = 3;

export default function useTCPNodes() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [configComplete, setConfigComplete] = useState(false);

  // Retry tracking
  const retriesRef = useRef(0);
  const timeoutRef = useRef(null);
  const waitingForResponseRef = useRef(false);

  const clearRetryTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const handleOpen = useCallback(() => {
    console.log('[useTCPNodes] WebSocket connected');
    setLoading(false);
  }, []);

  const handleMessage = useCallback((msg) => {
    try {
      const packet = typeof msg === 'string' ? JSON.parse(msg) : msg;
      if (!packet?.payload || packet.type === 'Unknown') return;

      const { nodeId, type, payload } = packet;

      // Got a valid packet — stop retry cycle
      waitingForResponseRef.current = false;
      clearRetryTimer();
      retriesRef.current = 0;

      if (payload.configCompleteId === 1 && !configComplete) {
        setConfigComplete(true);
        setLoading(false);
        console.log('[useTCPNodes] configCompleteId received');
      }

      setNodes(prev => upsertNode(prev, {
        id: payload.nodeId ?? payload.node_id ?? payload.num ?? payload.id,
        ...payload,
        nodeId,
        packetType: type
      }));

    } catch (e) {
      console.error('[useTCPNodes] Failed to process incoming packet', e);
      setError(e);
    }
  }, [configComplete, clearRetryTimer]);

  const handleError = useCallback((err) => {
    console.error('[useTCPNodes] WebSocket error', err);
    setError(err);
    setLoading(false);
  }, []);

  const handleClose = useCallback((event) => {
    console.log('[useTCPNodes] WebSocket closed', {
      code: event?.code,
      reason: event?.reason,
      wasClean: event?.wasClean
    });
  }, []);

  const handlers = useMemo(
    () => ({
      onOpen: handleOpen,
      onMessage: handleMessage,
      onError: handleError,
      onClose: handleClose
    }),
    [handleOpen, handleMessage, handleError, handleClose]
  );

  const { status, send } = useMeshSocketBridge({
    url: WS_URL,
    binary: false, // now expecting JSON
    handlers
  });

  // Public sendRequest now includes retry logic internally
  const sendRequest = useCallback(() => {
    setError(null);
    setLoading(true);
    setConfigComplete(false);

    if (status !== 'connected') {
      const err = new Error('WebSocket not connected');
      setError(err);
      setLoading(false);
      return;
    }

    try {
      const frame = buildWantConfigIDFrame();
      console.log('Sending frame:', frame);
      send(frame);
      console.log('[useTCPNodes] Request sent');

      waitingForResponseRef.current = true;

      // Schedule retry if no response
      clearRetryTimer();
      timeoutRef.current = setTimeout(() => {
        if (waitingForResponseRef.current && retriesRef.current < MAX_RETRIES) {
          retriesRef.current += 1;
          console.warn(
            `[useTCPNodes] No response, retrying (${retriesRef.current}/${MAX_RETRIES})`
          );
          sendRequest(); // recursive retry
        } else if (retriesRef.current >= MAX_RETRIES) {
          console.error('[useTCPNodes] Max retries reached, giving up');
          setLoading(false);
          waitingForResponseRef.current = false;
        }
      }, TIMEOUT_MS);
    } catch (e) {
      console.error('[useTCPNodes] Failed to send Request', e);
      setError(e);
      setLoading(false);
    }
  }, [status, send, clearRetryTimer]);

  useEffect(() => {
    if (status === 'connected' && !configComplete) {
      debugLogger('sendRequest - useTCPNodes');
      sendRequest();
    }
    return () => clearRetryTimer();
  }, [status, configComplete, sendRequest, clearRetryTimer]);

  return {
    nodes,
    error,
    loading,
    sendRequest // same name, now with retry baked in
  };
}

/* ---------- utils ---------- */

function upsertNode(prev, nodeObj) {
  const key = nodeObj?.num ?? nodeObj?.nodeId ?? nodeObj?.id;
  if (key == null) return prev;

  const i = prev.findIndex(
    (n) => (n?.num ?? n?.nodeId ?? n?.id) === key
  );
  if (i === -1) return [...prev, nodeObj];

  const copy = prev.slice();
  copy[i] = { ...prev[i], ...nodeObj };
  return copy;
}
