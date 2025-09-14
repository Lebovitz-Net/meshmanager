import { useEffect, useState } from 'react';
import NodeDetails from '@/components/Tabs/NodeDetails';
import { Box, Typography, Button } from '@mui/material';
import useTCPNodes from '@/hooks/useTCPNodes';

export default function Nodes({ useDummyData = false }) {
  const [nodes, setNodes] = useState([]);
  const [expandedNodeId, setExpandedNodeId] = useState(null);

  // 🔧 Define activation logic
  const active = !useDummyData; // Only activate bridge if not using dummy data

  // 🔧 Pass `active` into the hook
 const {
  nodes: tcpNodes,
  error,
  loading,
  sendRequest,
  status,
  protocolState
} = useTCPNodes({ active: true });


  useEffect(() => {
    if (useDummyData) {
      setNodes([
        {
          id: 'dummy1',
          longName: 'DummyNode1',
          hwModel: 'TestModel',
          position: { latitudeI: 42.0, longitudeI: -71.0, altitude: 100 },
          battery: 95,
          source: 'dummy',
          updated: Date.now()
        }
      ]);
    } else {
      setNodes(tcpNodes);
    }
  }, [useDummyData, tcpNodes]);

  const handleToggle = (nodeId) => {
    setExpandedNodeId((prev) => (prev === nodeId ? null : nodeId));
  };

  const refresh = () => sendRequest();

  if (loading && nodes.length === 0) {
    return <Typography>Connecting to mesh node via TCP...</Typography>;
  }

  if (nodes.length === 0) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Protocol State: <strong>{protocolState}</strong>
        </Typography>

        {protocolState === 'connecting' && (
          <Typography>Connecting to mesh node via TCP...</Typography>
        )}
        {protocolState === 'handshake' && (
          <Typography>Handshaking with mesh node...</Typography>
        )}
        {protocolState === 'retrying' && (
          <Typography>Retrying handshake...</Typography>
        )}
        {protocolState === 'ready' && (
          <Typography>No nodes received yet.</Typography>
        )}
        {protocolState === 'error' && (
          <Typography color="error">Bridge error occurred.</Typography>
        )}
        {protocolState === 'closed' && (
          <Typography>Bridge closed. Reactivate to reconnect.</Typography>
        )}

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            Error: {error.message || 'Unknown decoding failure'}
          </Typography>
        )}

        <Button onClick={refresh} variant="outlined" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }


  return (
    <Box>
      <Button onClick={refresh} variant="outlined" sx={{ mb: 2 }}>
        Refresh Nodes
      </Button>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error.message || 'Unknown decoding failure'}
        </Typography>
      )}
      {nodes.map((node, idx) => {
        const stableId =
          node.nodeId ?? node.id ?? node.user?.id ?? node.ip ?? `node-${idx}`;
        return (
          <NodeDetails
            key={stableId}
            node={node}
            status={status}
            expanded={expandedNodeId === stableId}
            onToggle={() => handleToggle(stableId)}
            useDummyData={useDummyData}
          />
        );
      })}
    </Box>
  );
}
