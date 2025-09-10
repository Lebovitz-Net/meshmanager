import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Divider } from '@mui/material';

const NodeIdentity = ({ identity, onSave }) => {
  const [form, setForm] = useState(identity || {
    nodeName: '',
    nodeId: '',
    groupKey: '',
    encryption: '',
  });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Node Identity</Typography>
      <Divider sx={{ mb: 2 }} />

      <TextField label="Node Name" fullWidth margin="normal" value={form.nodeName} onChange={handleChange('nodeName')} />
      <TextField label="Node ID" fullWidth margin="normal" value={form.nodeId} onChange={handleChange('nodeId')} />
      <TextField label="Group Key" fullWidth margin="normal" value={form.groupKey} onChange={handleChange('groupKey')} />
      <TextField label="Encryption Type" fullWidth margin="normal" value={form.encryption} onChange={handleChange('encryption')} />

      <Button variant="contained" sx={{ mt: 3 }} onClick={() => onSave?.(form)}>Save Identity</Button>
    </Box>
  );
};

export default NodeIdentity;
