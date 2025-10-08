// File: src/components/Tabs/ContactsTab.jsx

import { useState } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { useChannels } from '@/hooks/useChannels.js';
import ContactsCard from '@/components/Tabs/ContactsCard.jsx';
import ContactsDisplay from '@/components/Tabs/ContactsDisplay.jsx';
import MessageComposer from '@/components/Tabs/MessageComposer.jsx';

export default function ContactsTab({ nodeNum }) {
  const { channels, loading, error } = useChannels(nodeNum);
  const [selectedChannel, setSelectedChannel] = useState(null);

  const handleSendMessage = (text) => {
    // TODO: Wire to backend or protocol bridge
  };

  if (!nodeNum) {
    return (
      <Typography variant="body1" sx={{ p: 2 }}>
        No node selected.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!selectedChannel ? (
        <Box sx={{ padding: 2, overflowY: 'auto', flexGrow: 1 }}>
          <Typography variant="h5" gutterBottom>
            Mesh Channels for Node {nodeNum}
          </Typography>

          {loading && <CircularProgress />}
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              Error loading channels: {error.message}
            </Typography>
          )}

          {!loading &&
            !error &&
            channels.map(channel => (
              <ContactsCard
                key={channel.channel_num}
                channel={channel}
                isSelected={selectedChannel?.channel_num === channel.channel_num}
                onSelectChannel={setSelectedChannel}
              />
            ))}
        </Box>
      ) : (
        <>
          <Box sx={{ padding: 2 }}>
            <Button variant="outlined" onClick={() => setSelectedChannel(null)}>
              ← Back to Channels
            </Button>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <ContactsDisplay channel={selectedChannel} contact={{toNodeNum: 4294967295, fromNodeNum: nodeNum}}/>
          </Box>
        </>
      )}
    </Box>
  );
}
