// File: src/components/Tabs/Contact.jsx

import { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import ContactsCard from './ContactsCard';
import ContactsDisplay from './ContactsDisplay';
import { fetchChannels } from '@/hooks/useChannels';

export default function Contact() {
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);

  useEffect(() => {
    fetchChannels().then(setChannels);
  }, []);

  const selectedChannel = channels.find(c => c.id === selectedChannelId);

  return (
    <Box sx={{ padding: 2 }}>
      {!selectedChannelId ? (
        <>
          <Typography variant="h5" gutterBottom>Mesh Channels</Typography>
          {channels.map(channel => (
            <ContactsCard
              key={channel.id}
              channel={channel}
              isSelected={channel.id === selectedChannelId}
              onSelectChannel={setSelectedChannelId}
            />
          ))}
        </>
      ) : (
        <>
          <Button variant="outlined" onClick={() => setSelectedChannelId(null)}>
            ← Back to Channels
          </Button>
          <ContactsDisplay channel={selectedChannel} />
        </>
      )}
    </Box>
  );
}
