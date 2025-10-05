// File: src/hooks/useChannels.js
import { useEffect, useState } from 'react';

export function useChannels(nodeNum) {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('...useChannel ', nodeNum);
    if (!nodeNum) return;

    async function fetchChannels() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/channels/${nodeNum}`);
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        setChannels(data);
      } catch (err) {
        console.error('[useChannels] error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchChannels();
  }, [nodeNum]);

  return { channels, loading, error };
}
