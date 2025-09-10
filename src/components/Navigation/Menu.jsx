import React from 'react';
import { Box, Button, Typography } from '@mui/material';

const Menu = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        px: 3,
        py: 1,
        alignItems: 'center',
        borderBottom: '1px solid #ccc',
        backgroundColor: '#f9f9f9',
      }}
    >
      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
        Mesh Dashboard Menu
      </Typography>

      <Button variant="outlined" size="small">
        Refresh
      </Button>
      <Button variant="outlined" size="small">
        Export Logs
      </Button>
      <Button variant="outlined" size="small">
        Settings
      </Button>
    </Box>
  );
};

export default Menu;
