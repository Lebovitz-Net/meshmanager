// File: src/components/Tabs/ContactsTab.jsx

import { useState } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { useChannels } from '@/hooks/useChannels.js';
import ContactsCard from '@/components/Tabs/ContactsCard.jsx';
import ContactsDisplay from '@/components/Tabs/ContactsDisplay.jsx';

export default function ContactsTab({ nodeNum }) {
  const { channels, loading, error } = useChannels(nodeNum);
  console.log('...ContactsTab', channels);

  // store the full channel object instead of just the id
  const [selectedChannel, setSelectedChannel] = useState(null);

  if (!nodeNum) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6">No active nodeNum selected.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2 }}>
      {!selectedChannel ? (
        <>
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
                onSelectChannel={setSelectedChannel} // pass full channel object
              />
            ))}
        </>
      ) : (
        <>
          <Button variant="outlined" onClick={() => setSelectedChannel(null)}>
            ← Back to Channels
          </Button>
          <ContactsDisplay channel={selectedChannel} />
        </>
      )}
    </Box>
  );
}
