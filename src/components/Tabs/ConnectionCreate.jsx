import { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

export default function ConnectionCreate({ onCreate }) {
  const [ipOrName, setIpOrName] = useState('');
  const [port, setPort] = useState('4403');

  const handleSubmit = () => {
    if (!ipOrName) return;

    const isIP = ipOrName.includes('.');
    const newConnection = {
      id: `ws-${Date.now()}`,
      protocol: 'WS',
      ip: isIP ? ipOrName : undefined,
      name: !isIP ? ipOrName : undefined,
      port: parseInt(port, 10),
      status: 'disconnected',
    };

    onCreate(newConnection);
    setIpOrName('');
    setPort('4403');
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <TextField
        label="Name or IP"
        value={ipOrName}
        onChange={(e) => setIpOrName(e.target.value)}
        fullWidth
      />
      <TextField
        label="Port"
        value={port}
        onChange={(e) => setPort(e.target.value)}
        sx={{ width: 120 }}
      />
      <Button variant="contained" onClick={handleSubmit}>
        Add
      </Button>
    </Box>
  );
}
