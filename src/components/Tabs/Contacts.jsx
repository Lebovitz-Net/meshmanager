import { meshChannels } from '@/components/Tabs/Channels';
import ChannelCard from '@/components/Tabs/ChannelCard';
import MessageList from '@/components/Tabs/MessageList';
import { Box, Typography } from '@mui/material';
import { useState } from 'react';

export default function Contacts() {
  const [selectedChannelId, setSelectedChannelId] = useState(null);

  const channels = meshChannels();
  const selectedChannel = channels.find(c => c.id === selectedChannelId);

  // Placeholder messages array for demo/testing
  const messages = [
    { id: 1, channelId: 1, text: 'Welcome to KD1MU Primary' },
    { id: 2, channelId: 2, text: 'Mesh Relay active' },
    { id: 3, channelId: 1, text: 'Emergency test broadcast' },
    { id: 4, channelId: 3, text: 'Beacon ping received' },
  ];

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Mesh Channels
      </Typography>

          <Box>
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            isSelected={channel.id === selectedChannelId}
            onSelectChannel={setSelectedChannelId}
          />
        ))}
      </Box>

      {selectedChannelId && (
        <Box sx={{ marginTop: 4 }}>
          <Typography variant="h6" gutterBottom>
            Messages in {selectedChannel?.name}
          </Typography>
          <MessageList messages={messages.filter((msg) => msg.channelId === selectedChannelId)} />
        </Box>
      )}
    </Box>
  );
}
