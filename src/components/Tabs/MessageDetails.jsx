import { Typography } from '@mui/material';

export default function MessageDetails({ message }) {
  return (
    <>
      <Typography variant="body2">Timestamp: {message.timestamp}</Typography>
      <Typography variant="body2">Channel: {message.channel}</Typography>
      {/* Add raw payload, encryption status, etc. */}
    </>
  );
}
