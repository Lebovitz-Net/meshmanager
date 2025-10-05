// File: src/components/Tabs/ContactsCard.jsx

import { Card, CardContent, Typography } from '@mui/material';

export default function ContactsCard({ channel, isSelected, onSelectChannel }) {
  return (
    <Card
      sx={{
        mb: 2,
        cursor: 'pointer',
        border: isSelected ? '2px solid #1976d2' : '1px solid #ccc',
        backgroundColor: isSelected ? '#e3f2fd' : '#fff',
        transition: 'all 0.2s ease-in-out'
      }}
      // Pass the full channel object instead of just channel_num
      onClick={() => onSelectChannel(channel)}
    >
      <CardContent>
        <Typography variant="h6">{channel.name}</Typography>
        <Typography variant="body2">Psk: {channel.psk}</Typography>
        <Typography variant="body2">Role: {channel.role}</Typography>
      </CardContent>
    </Card>
  );
}
