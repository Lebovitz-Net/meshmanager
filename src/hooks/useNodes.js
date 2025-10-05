// src/api/meshBridge.js
import { useEffect, useState } from 'react';

/**
 * Custom hook to fetch enriched node records from meshBridgeServer.
 * Returns { nodes, loading, error } for UI consumption.
 */
export function useListNodes() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNodes() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/v1/nodes');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch nodes: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        setNodes(data);
      } catch (err) {
        console.error('[meshBridge] listNodes error:', err);
        setError(err);
        setNodes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNodes();
  }, []);

  return { nodes, loading, error };
}
