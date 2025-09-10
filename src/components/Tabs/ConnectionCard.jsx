import { Card, CardContent, Typography, Chip, Box } from '@mui/material';

// Temporary mock node lookup
const mockNodes = [
  { id: 101, shortName: 'KD1MU-Relay', longName: 'KD1MU Mesh Relay Node' },
  { id: 102, shortName: 'KD1MU-Gateway', longName: 'KD1MU Internet Gateway' },
];

// Temporary mock connection data
const mockConnections = [
  {
    id: 'ws-101',
    protocol: 'WS',
    ip: '192.168.1.101',
    port: 4403,
    targetNodeId: 101,
    status: 'connected',
    lastSeen: '2025-08-25T14:20:00Z',
  },
  {
    id: 'ws-102',
    protocol: 'WS',
    ip: '192.168.1.102',
    port: 4403,
    targetNodeId: 102,
    status: 'disconnected',
  },
];

export default function ConnectionCard({ connection }) {
  const node = mockNodes.find(n => n.id === connection.targetNodeId);

  return (
    <Card sx={{ marginBottom: 2 }}>
      <CardContent>
        <Typography variant="subtitle1">
          {node?.shortName || 'Unknown'} — {node?.longName || connection.targetNodeId}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Protocol: {connection.protocol} | IP: {connection.ip}:{connection.port}
        </Typography>
        <Box sx={{ marginTop: 1 }}>
          <Chip
            label={connection.status === 'connected' ? 'Connected' : 'Disconnected'}
            color={connection.status === 'connected' ? 'success' : 'default'}
            size="small"
          />
        </Box>
        {connection.lastSeen && (
          <Typography variant="caption" color="text.secondary" sx={{ marginTop: 1 }}>
            Last seen: {new Date(connection.lastSeen).toLocaleString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// Optional: render all mock connections for testing
export function ConnectionList() {
  return (
    <Box sx={{ padding: 2 }}>
      {mockConnections.map(conn => (
        <ConnectionCard key={conn.id} connection={conn} />
      ))}
    </Box>
  );
}
