import { Card, CardContent, Typography } from '@mui/material';

export default function ChannelCard({ channel }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{channel.name}</Typography>
        <Typography variant="body2">Frequency: {channel.frequency}</Typography>
        <Typography variant="body2">Mode: {channel.mode}</Typography>
      </CardContent>
    </Card>
  );
}
