// File: src/components/Tabs/ContactsDisplay.jsx

import {
  Box,
  Typography,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useState, useCallback } from 'react';
import MessageList from './MessageList';
import MessageThreadedList from './MessageThreadedList';
import { useMessagesForChannel } from '@/hooks/useMessagesForChannel';
import { useSendMessage } from '@/hooks/useSendMessage';
import MessageComposer from './MessageComposer';
import useSSE from '@/hooks/useSSE.js';

// Deduplicates and sorts messages by timestamp DESC
function mergeMessages(base, incoming) {
  const ids = new Set(base.map(m => m.messageId));
  const combined = [...base, ...incoming.filter(m => !ids.has(m.messageId))];
  return combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export default function ContactsDisplay({ channel, contact }) {
  const { messages: initialMessages, loading, error } = useMessagesForChannel(
    channel?.channel_num ?? channel?.id,

    contact?.nodeNum
  );

  const [threadedView, setThreadedView] = useState(true);
  const [liveMessages, setLiveMessages] = useState([]);

  // 🔄 Listen for live message updates via SSE
  const handleMessages = useCallback((data) => {
    console.log('SSE message event', data.message.channelId, channel?.channel_num);
    if (data.message.channelId === channel?.channel_num) {
      console.log('New message for current channel');
      setLiveMessages(prev => mergeMessages(prev, [data.message]));
    }
  }, [channel?.channel_num]);
  useSSE('message', handleMessages);

  function handleSendMessage(text) {
    useSendMessage(text, channel, contact);
  }

  if (!channel) {
    return (
      <Typography variant="body1" sx={{ mt: 2 }}>
        Select a channel to view messages
      </Typography>
    );
  }

  // Prefer enriched identity fields for display
  const contactLabel =
    contact?.shortName ||
    contact?.longName ||
    contact?.userId ||
    contact?.user ||
    contact?.nodeNum;

  // 🧱 Merge initial and live messages directly
  const allMessages = mergeMessages(initialMessages, liveMessages);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6" gutterBottom>
          {contact
            ? `Messages with ${contactLabel} in ${channel.name}`
            : `Messages in ${channel.name}`}
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={threadedView}
              onChange={() => setThreadedView(prev => !prev)}
              color="primary"
            />
          }
          label="Threaded View"
          sx={{ mb: 2 }}
        />

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            Error loading messages: {error.message}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          paddingX: 2,
          paddingBottom: 10
        }}
      >
        {!loading && !error && allMessages.length === 0 && (
          <Typography>No messages found…</Typography>
        )}

        {!loading && !error && allMessages.length > 0 && (
          <MessageThreadedList messages={allMessages} threaded={threadedView} />
        )}
      </Box>

      <MessageComposer onSend={handleSendMessage} />
    </Box>
  );
}
