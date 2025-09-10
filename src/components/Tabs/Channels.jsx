// File: src/components/Tabs/channels.jsx

//import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import ChannelCard from '@/components/Tabs/ChannelCard';

let _channels = [
    { id: 1, name: 'KD1MU Primary', frequency: '146.520 MHz', mode: 'FM' },
    { id: 2, name: 'Mesh Relay', frequency: '915 MHz', mode: 'LoRa' },
    { id: 3, name: 'Emergency Beacon', frequency: '433 MHz', mode: 'Digital' },
  ];

// Getter function
export function meshChannels() {
  return _channels;
}

// Optional setter for testing/dev overrides
export function setMeshChannels(newChannels) {
  _channels = newChannels;
}

export default function Channels() {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Active Channels
      </Typography>
      {meshChannels().map((channel) => (
        <ChannelCard 
          key={channel.id} 
          channel={channel} />
      ))}


    </Box>
  );
}