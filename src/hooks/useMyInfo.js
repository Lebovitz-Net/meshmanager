// File: src/api/useMyInfo.js

import { useEffect, useState } from 'react';

/**
 * Hook to fetch managed nodes from /api/v1/myinfo.
 * Returns { nodes, loading, error } for UI consumption.
 */
export function useMyInfo() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMyInfo() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/v1/myinfo');
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        setNodes(data);
      } catch (err) {
        console.error('[meshBridge] fetchMyInfo error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMyInfo();
  }, []);

  return { nodes, loading, error };
}
