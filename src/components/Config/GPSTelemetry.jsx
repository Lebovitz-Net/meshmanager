import React from 'react';
import { Box, Typography, Divider, List, ListItem, ListItemText } from '@mui/material';

const mockTelemetry = [
  { time: '16:30', lat: 42.34, lon: -71.12, speed: '0 km/h', heading: 'N' },
  { time: '16:29', lat: 42.34, lon: -71.12, speed: '0 km/h', heading: 'N' },
];

const GPSTelemetry = () => (
  <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
    <Typography variant="h5" gutterBottom>GPS & Telemetry</Typography>
    <Divider sx={{ mb: 2 }} />
    <List>
      {mockTelemetry.map((entry, idx) => (
        <ListItem key={idx}>
          <ListItemText
            primary={`${entry.time} — ${entry.lat}, ${entry.lon}`}
            secondary={`Speed: ${entry.speed}, Heading: ${entry.heading}`}
          />
        </ListItem>
      ))}
    </List>
  </Box>
);

export default GPSTelemetry;
