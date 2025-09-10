import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { Settings } from '@mui/icons-material';

function TopBar({ onSettingsClick }) {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Mesh Dashboard</Typography>
        <IconButton color="inherit" onClick={onSettingsClick}>
          <Settings />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
