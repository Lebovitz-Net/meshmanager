// File: src/hooks/useMessagesByChannel.js

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
  if (channelId == null) {   // only skip if null or undefined, not 0
    setMessages([]);
    return;
  }

  const controller = new AbortController();

  async function fetchMessages() {
    setLoading(true);
    setError(null);

    try {
      const url = contactNodeNum
        ? `/api/v1/channels/${channelId}/messages?nodeNum=${contactNodeNum}`
        : `/api/v1/channels/${channelId}/messages`;

      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch messages: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      // Always normalize to an array
      setMessages(Array.isArray(data) ? data : []);
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
