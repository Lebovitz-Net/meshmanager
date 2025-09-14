import { useEffect, useRef } from 'react';

export function useNodeDiagnostics({ nodeNum, packet }) {
  const historyRef = useRef([]);

  useEffect(() => {
    if (!packet || typeof nodeNum !== 'number') return;

    const timestamp = new Date().toISOString();
    const fields = Object.keys(packet).join(', ');
    const entry = { timestamp, nodeNum, fields, packet };

    historyRef.current.push(entry);

    console.debug(`[NodeDiagnostics] ${timestamp} - Node ${nodeNum}:`, fields);
  }, [packet, nodeNum]);

  return {
    getHistory: () => historyRef.current,
    latest: historyRef.current[historyRef.current.length - 1] ?? null
  };
}
