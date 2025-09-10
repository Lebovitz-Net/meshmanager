import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { knownNodes, setNodeIP } from '@/src/utils/config';

const NodeSelector = () => {
  const handleChange = (e) => {
    setNodeIP(e.target.value);
    window.location.reload(); // reload to re-init WebSocket/API
  };

  return (
    <FormControl fullWidth sx={{ mt: 2 }}>
      <InputLabel>Mesh Node</InputLabel>
      <Select defaultValue={knownNodes[0].ip} onChange={handleChange}>
        {knownNodes.map((node) => (
          <MenuItem key={node.ip} value={node.ip}>{node.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default NodeSelector;
