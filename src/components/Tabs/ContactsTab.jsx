// File: src/components/Tabs/ContactsTab.jsx

import { useState, useCallback } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { useChannels } from '@/hooks/useChannels.js';
import ContactsCard from '@/components/Tabs/ContactsCard.jsx';
import ContactsDisplay from '@/components/Tabs/ContactsDisplay.jsx';
import useSSE from '@/hooks/useSSE.js';

// Helper to upsert channel into array
function upsertChannel(channels, incoming) {
  const index = channels.findIndex(c => c.channel_num === incoming.channel_num);
  if (index === -1) return [...channels, incoming];
  const updated = [...channels];
  updated[index] = { ...updated[index], ...incoming };
  return updated;
}

export default function ContactsTab({ nodeNum }) {
  const { channels: initialChannels, loading, error } = useChannels(nodeNum);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [liveChannels, setLiveChannels] = useState([]);

  // 🔄 Listen for live channel updates via SSE
  const handleChannels = useCallback((data) => {
    setLiveChannels(prev => upsertChannel(prev, data.channel));
  }, []);
  useSSE('channel', handleChannels);

  if (!nodeNum) {
    return (
      <Typography variant="body1" sx={{ p: 2 }}>
        No node selected.
      </Typography>
    );
  }

  // 🧱 Merge initial and live channels
  const mergedChannels = [...initialChannels, ...liveChannels].reduce((acc, channel) => {
    const existing = acc.find(c => c.channel_num === channel.channel_num);
    if (!existing) return [...acc, channel];
    return acc.map(c => c.channel_num === channel.channel_num ? { ...c, ...channel } : c);
  }, []);

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
            mergedChannels.map(channel => (
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
            <ContactsDisplay
              channel={selectedChannel}
              contact={{
                nodeNum,                // local node
                toNodeNum: 4294967295,  // broadcast or peer
                // enriched fields if available
                shortName: selectedChannel.shortName,
                longName: selectedChannel.longName,
                userId: selectedChannel.userId,
                macaddr: selectedChannel.macaddr,
                hwModel: selectedChannel.hwModel,
                publicKey: selectedChannel.publicKey,
                isUnmessagable: selectedChannel.isUnmessagable,
                updatedAt: selectedChannel.updatedAt
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
