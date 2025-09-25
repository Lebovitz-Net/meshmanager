import React from 'react';
import { Box, Typography, Divider, List, ListItem, ListItemText } from '@mui/material';

const mockLogs = [
  { time: '16:22', type: 'INFO', message: 'Node booted successfully' },
  { time: '16:25', type: 'WARN', message: 'Low battery warning' },
  { time: '16:27', type: 'ERROR', message: 'LoRa timeout detected' },
];

const LogsAlerts = () => (
  <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
    <Typography variant="h5" gutterBottom>Logs & Alerts</Typography>
    <Divider sx={{ mb: 2 }} />
    <List>
      {mockLogs.map((log, idx) => (
        <ListItem key={idx}>
          <ListItemText
            primary={`${log.time} — ${log.type}`}
            secondary={log.message}
          />
        </ListItem>
      ))}
    </List>
  </Box>
);

export default LogsAlerts;
