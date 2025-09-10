import React from 'react';
import { Box, Typography, Divider, Grid, Paper } from '@mui/material';

const mockMetrics = {
  packetsSent: 1245,
  packetsReceived: 1198,
  rssi: -72,
  snr: 9.5,
  routingHops: 2,
};

const Metrics = () => (
  <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
    <Typography variant="h5" gutterBottom>Node Metrics</Typography>
    <Divider sx={{ mb: 2 }} />
    <Grid container spacing={2}>
      {Object.entries(mockMetrics).map(([key, value]) => (
        <Grid item xs={6} key={key}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">{key}</Typography>
            <Typography variant="h6">{value}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default Metrics;
