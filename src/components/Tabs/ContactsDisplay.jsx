// File: src/components/Tabs/ContactsDisplay.jsx

import {
  Box,
  Typography,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useState } from 'react';
import MessageList from './MessageList';
import MessageThreadedList from './MessageThreadedList';
import { useMessagesForChannel } from '@/hooks/useMessagesForChannel';
import { useSendMessage } from '@/hooks/useSendMessage';
import MessageComposer from './MessageComposer';


export default function ContactsDisplay({ channel, contact }) {
  const { messages, loading, error } = useMessagesForChannel(
    channel?.channel_num ?? channel?.id,
    contact?.nodeNum
  );

  const [threadedView, setThreadedView] = useState(true);

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6" gutterBottom>
          {contact
            ? `Messages with ${contact.user || contact.nodeNum} in ${channel.name}`
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
        {!loading && !error && messages.length === 0 && (
          <Typography>No messages found…</Typography>
        )}

        {!loading && !error && messages.length > 0 && (
         <MessageThreadedList messages={messages} threaded={threadedView}/>
        )}
      </Box>

      <MessageComposer onSend={handleSendMessage} />
    </Box>
  );
}
