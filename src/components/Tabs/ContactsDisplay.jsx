// File: src/components/Tabs/ContactsDisplay.jsx

import { Box, Typography, CircularProgress } from '@mui/material';
import MessageList from './MessageList';
import { useMessagesForChannel } from '@/hooks/useMessagesForChannel';

export default function ContactsDisplay({ channel, contact }) {
  console.log('...ContactDisplay ', channel);
  const { messages, loading, error } = useMessagesForChannel(
    channel?.channel_num ?? channel?.id, // support both shapes
    contact?.nodeNum // optional filter
  );

  if (!channel) {
    return (
      <Typography variant="body1" sx={{ mt: 2 }}>
        Select a channel to view messages
      </Typography>
    );
  }

  return (
    <Box sx={{ marginTop: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        {contact
          ? `Messages with ${contact.user || contact.nodeNum} in ${channel.name}`
          : `Messages in ${channel.name}`}
      </Typography>

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

      {!loading && !error && messages.length === 0 && (
        <Typography>No messages found…</Typography>
      )}

      {!loading && !error && messages.length > 0 && (
        <MessageList messages={messages} />
      )}

    </Box>
  );
}
