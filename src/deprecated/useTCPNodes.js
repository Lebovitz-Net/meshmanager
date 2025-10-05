import { useState } from 'react';
import { useNodesState } from '@/hooks/useNodesState';
import { useMeshSocketBridge } from '@/hooks/useMeshSocketBridge';
import { decodeFrame } from '@/utils/decodeFrame.js';

export default function useTCPNodes({ active = true }) {
  // const [nodes, setNodes] = useState([]);
  const [error, setError] = useState(null);

  const { nodes, addNode } = useNodesState();

  const bridge = useMeshSocketBridge({
    active,
    idleMs: 10000,
    binary: false,
    handlers: {
      onMessage: handleMessage,
      onError: setError,
      onClose: () => console.log('[TCPNodes] Connection closed'),
      onReady: () => console.log('[TCPNodes] Protocol ready')
    }
  });

  function handleMessage(data) {
    try {
      console.log('[TCPNodes] handleMessage data:', typeof data, data);

      addNode(data.nodeInfo);

    } catch (err) {
      console.warn('[TCPNodes] Decode error:', err);
      setError({ message: 'Malformed packet', raw: data });
    }
  }

  return {
    nodes,
    error,
    loading: bridge.protocolState !== 'ready',
    protocolState: bridge.protocolState,
    sendRequest: bridge.sendRequest
  };
}
