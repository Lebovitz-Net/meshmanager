import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Select, MenuItem,
  FormControl, InputLabel, Button, Divider
} from '@mui/material';
import { API_URL } from '@/src/utils/config';

const regions = ['US', 'EU', 'AU', 'JP'];
const modulations = ['LoRa', 'FSK', 'GFSK'];

const RadioConfig = () => {
  const [form, setForm] = useState({
    frequency: '',
    powerLevel: '',
    region: '',
    modulation: '',
    bandwidth: '',
    spreadingFactor: '',
  });

  useEffect(() => {
    fetch(`${API_URL}/radio/config`)
      .then((res) => res.json())
      .then((data) => setForm(data))
      .catch((err) => console.error('Failed to load radio config:', err));
  }, []);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSave = () => {
    fetch(`${API_URL}/radio/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => res.ok && console.log('Config saved'))
      .catch((err) => console.error('Failed to save config:', err));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Radio Configuration</Typography>
      <Divider sx={{ mb: 2 }} />

      <TextField label="Frequency (MHz)" fullWidth margin="normal" value={form.frequency} onChange={handleChange('frequency')} />
      <TextField label="Power Level (dBm)" fullWidth margin="normal" value={form.powerLevel} onChange={handleChange('powerLevel')} />

      <FormControl fullWidth margin="normal">
        <InputLabel>Region</InputLabel>
        <Select value={form.region} onChange={handleChange('region')}>
          {regions.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Modulation</InputLabel>
        <Select value={form.modulation} onChange={handleChange('modulation')}>
          {modulations.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
        </Select>
      </FormControl>

      <TextField label="Bandwidth (kHz)" fullWidth margin="normal" value={form.bandwidth} onChange={handleChange('bandwidth')} />
      <TextField label="Spreading Factor" fullWidth margin="normal" value={form.spreadingFactor} onChange={handleChange('spreadingFactor')} />

      <Button variant="contained" sx={{ mt: 3 }} onClick={handleSave}>Save Configuration</Button>
    </Box>
  );
};

export default RadioConfig;
