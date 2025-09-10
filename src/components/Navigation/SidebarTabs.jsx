import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const tabLabels = [
  { label: 'Contacts', path: '/contacts' },
  { label: 'Nodes', path: '/nodes' },
  { label: 'Map', path: '/map' },
  { label: 'Channels', path: '/channels' },
  { label: 'Connections', path: '/connections' },
];

function SidebarTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = tabLabels.find(tab => location.pathname.startsWith(tab.path))?.label || 'Map';

  const handleChange = (e, newLabel) => {
    const tab = tabLabels.find(t => t.label === newLabel);
    if (tab) navigate(tab.path);
  };

  return (
    <Box width={160} bgcolor="#f5f5f5" borderRight="1px solid #ccc">
      <Tabs
        orientation="vertical"
        value={currentTab}
        onChange={handleChange}
      >
        {tabLabels.map(tab => (
          <Tab key={tab.path} label={tab.label} value={tab.label} />
        ))}
      </Tabs>
    </Box>
  );
}

export default SidebarTabs;
