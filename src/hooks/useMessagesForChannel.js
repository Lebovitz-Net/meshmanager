// File: src/hooks/useMessagesForChannel.js

import { useEffect, useState } from 'react';

/**
 * Custom hook to fetch messages for a given channel (and optional contact)
 * from meshBridgeServer.
 *
 * @param {string|number} channelId - The channel identifier
 * @param {string|number} [contactNodeNum] - Optional nodeNum to filter messages by contact
 * @returns {{ messages: Array, loading: boolean, error: Error|null }}
 */
export function useMessagesForChannel(channelId, contactNodeNum) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (channelId == null) {
      setMessages([]);
      return;
    }

    const controller = new AbortController();

    async function fetchMessages() {
      setLoading(true);
      setError(null);

      try {
        // For now, we always hit the enriched endpoint
        const url = `/api/v1/channels/${channelId}/messages`;

        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch messages: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();

        // Normalize to array and ensure enriched fields are preserved
        const normalized = Array.isArray(data) ? data : [];
        setMessages(normalized);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[meshBridge] fetchMessages error:', err);
          setError(err);
          setMessages([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();

    return () => controller.abort();
  }, [channelId, contactNodeNum]);

  return { messages, loading, error };
}
