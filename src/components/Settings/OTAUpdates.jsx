import React from 'react';
import { Box, Typography, Button, Divider, List, ListItem, ListItemText } from '@mui/material';

const mockChangelog = [
  { version: 'v3.16', date: '2025-05-05', notes: 'Improved DMR handling, bug fixes' },
  { version: 'v3.15', date: '2025-03-12', notes: 'Added GPS telemetry support' },
];

const OTAUpdates = () => {
  const handleUpdate = () => {
    // Trigger OTA update logic
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>OTA Firmware Updates</Typography>
      <Divider sx={{ mb: 2 }} />
      <Button variant="contained" onClick={handleUpdate}>Trigger Update</Button>

      <Typography variant="h6" sx={{ mt: 4 }}>Changelog</Typography>
      <List>
        {mockChangelog.map((entry) => (
          <ListItem key={entry.version}>
            <ListItemText
              primary={`${entry.version} — ${entry.date}`}
              secondary={entry.notes}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default OTAUpdates;
