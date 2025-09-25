import React, { useState } from 'react';
import { Box, TextField, Button, FormControlLabel, Switch } from '@mui/material';

const TelemetryTab = ({ sendSocketMessage }) => {
  const [telemetry, setTelemetry] = useState({
    interval: 60,
    gps: true,
    battery: true,
  });

  const handleChange = (field) => (e) => {
    const value = field === 'interval' ? Number(e.target.value) : e.target.checked;
    setTelemetry({ ...telemetry, [field]: value });
  };

  const handleSave = () => {
    sendSocketMessage(telemetry);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <TextField label="Interval (sec)" fullWidth type="number" value={telemetry.interval} onChange={handleChange('interval')} />
      <FormControlLabel control={<Switch checked={telemetry.gps} onChange={handleChange('gps')} />} label="GPS Reporting" sx={{ mt: 2 }} />
      <FormControlLabel control={<Switch checked={telemetry.battery} onChange={handleChange('battery')} />} label="Battery Reporting" />
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSave}>Send Telemetry</Button>
    </Box>
  );
};

export default TelemetryTab;
