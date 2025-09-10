import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import ConnectionCard from '@/components/Tabs/ConnectionCard';
import ConnectionCreate from '@/components/Tabs/ConnectionCreate'; // updated import

const initialConnections = [
  {
    id: 'ws-101',
    protocol: 'WS',
    ip: '192.168.2.79',
    port: 4403,
    targetNodeId: 101,
    status: 'disconnected',
    lastSeen: '2025-08-25T14:20:00Z',
  },
  {
    id: 'ws-102',
    protocol: 'WS',
    ip: '192.168.2.102',
    port: 4403,
    targetNodeId: 102,
    status: 'connected',
  },
];

const nodes = [
  { id: 101, shortName: 'KD1MU-Relay', longName: 'KD1MU Mesh Relay Node', mqtt: true },
  { id: 102, shortName: 'KD1MU-Gateway', longName: 'KD1MU Internet Gateway', mqtt: false },
];

export default function Connections() {
  const [connections, setConnections] = useState(initialConnections);

  const handleAddConnection = (newConn) => {
    setConnections(prev => [...prev, {
      ...newConn,
      id: `ws-${Date.now()}`,
      status: 'disconnected',
      targetNodeId: newConn.name ? 999 : 0, // placeholder for resolution
    }]);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Active Connections
      </Typography>

      <ConnectionCreate onCreate={handleAddConnection} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 3 }}>
        {connections.map((conn) => {
          const node = nodes.find(n => n.id === conn.targetNodeId);
          return (
            <ConnectionCard
              key={conn.id}
              connection={conn}
              node={node}
            />
          );
        })}
      </Box>
    </Box>
  );
}



// import React, { useState } from 'react';
// import { Typography, TextField, Button, Box } from '@mui/material';

// function Connections() {
//   const [ip, setIp] = useState('192.168.2.79');
//   const [status, setStatus] = useState('Disconnected');

//   const handleConnect = () => {
//     // Placeholder for actual WebSocket logic
//     setStatus('Connected to ' + ip);
//   };

//   return (
//     <Box>
//       <Typography variant="h5" gutterBottom>Connection Settings</Typography>
//       <TextField
//         label="Node IP Address"
//         value={ip}
//         onChange={(e) => setIp(e.target.value)}
//         fullWidth
//         margin="normal"
//       />
//       <Button variant="contained" onClick={handleConnect}>Connect</Button>
//       <Typography variant="body1" mt={2}>Status: {status}</Typography>
//     </Box>
//   );
// }

// export default Connections;
