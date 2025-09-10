import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildWantConfigIDFrame } from '@/utils/protoHelpers.js';
import { useMeshSocketBridge } from '@/hooks/useMeshSocketBridge.js';
import { debugLogger } from '@/utils/config.js';

const WS_URL = import.meta?.env?.VITE_TCP_BRIDGE_URL || 'ws://localhost:8080';

export default function useTCPNodes() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [configComplete, setConfigComplete] = useState(false);

  const handleOpen = useCallback(() => {
    console.log('[useTCPNodes] WebSocket connected');
    setLoading(false);
  }, []);

  const handleMessage = useCallback((msg) => {
    try {
      const packet = typeof msg === 'string' ? JSON.parse(msg) : msg;
      if (!packet?.payload || packet.type === 'Unknown') return;

      const { nodeId, type, payload } = packet;

      if (payload.configCompleteId === 1 && !configComplete) {
        setConfigComplete(true);
        setLoading(false);
        console.log('[useTCPNodes] configCompleteId received');
      }

      setNodes((prev) => upsertNode(prev, { ...payload, nodeId, packetType: type }));
    } catch (e) {
      console.error('[useTCPNodes] Failed to process incoming packet', e);
      setError(e);
    }
  }, [configComplete]);

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

  const handlers = useMemo(() => ({
    onOpen: handleOpen,
    onMessage: handleMessage,
    onError: handleError,
    onClose: handleClose
  }), [handleOpen, handleMessage, handleError, handleClose]);

  const { status, send } = useMeshSocketBridge({
    url: WS_URL,
    binary: false, // now expecting JSON
    handlers
  });

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
    } catch (e) {
      console.error('[useTCPNodes] Failed to send Request', e);
      setError(e);
      setLoading(false);
    }
  }, [status, send]);

  useEffect(() => {
    if (status === 'connected' && !configComplete) {
      debugLogger("sendRequest - useTCPNodes");
      sendRequest();
    }
  }, [status, sendRequest]);

  return {
    nodes,
    error,
    loading,
    sendRequest
  };
}

/* ---------- utils ---------- */

function upsertNode(prev, nodeObj) {
  const key = nodeObj?.num ?? nodeObj?.nodeId ?? nodeObj?.id;
  if (key == null) return prev;

  const i = prev.findIndex((n) => (n?.num ?? n?.nodeId ?? n?.id) === key);
  if (i === -1) return [...prev, nodeObj];

  const copy = prev.slice();
  copy[i] = { ...prev[i], ...nodeObj };
  return copy;
}
