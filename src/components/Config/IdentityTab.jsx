import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

const IdentityTab = ({ sendSocketMessage }) => {
  const [identity, setIdentity] = useState({
    callsign: '',
    group: '',
    nickname: '',
  });

  const handleChange = (field) => (e) => {
    setIdentity({ ...identity, [field]: e.target.value });
  };

  const handleSave = () => {
    sendSocketMessage(identity);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <TextField label="Callsign" fullWidth value={identity.callsign} onChange={handleChange('callsign')} />
      <TextField label="Group" fullWidth sx={{ mt: 2 }} value={identity.group} onChange={handleChange('group')} />
      <TextField label="Nickname" fullWidth sx={{ mt: 2 }} value={identity.nickname} onChange={handleChange('nickname')} />
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSave}>Send Identity</Button>
    </Box>
  );
};

export default IdentityTab;
