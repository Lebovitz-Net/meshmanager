import { useEffect, useState } from 'react';
import NodeDetails from '@/components/Tabs/NodeDetails';
import { Box, Typography, Button } from '@mui/material';
import useTCPNodes from '@/hooks/useTCPNodes';

export default function Nodes({ useDummyData = false }) {
  const [nodes, setNodes] = useState([]);
  const [expandedNodeId, setExpandedNodeId] = useState(null); // track expanded node

  const {
    nodes: tcpNodes,
    error,
    loading,
    sendRequest,
  } = useTCPNodes();

  const refresh = () => {
    sendRequest();
  };

  useEffect(() => {
    if (useDummyData) {
      setNodes([
        { id: 'dummy1', name: 'DummyNode1', ip: '10.0.0.1', channel: 'A' },
        { id: 'dummy2', name: 'DummyNode2', ip: '10.0.0.2', channel: 'B' },
      ]);
    } else {
      setNodes(tcpNodes);
    }
  }, [useDummyData, tcpNodes]);

  const handleToggle = (nodeId) => {
    setExpandedNodeId((prev) => (prev === nodeId ? null : nodeId));
  };

  if (useDummyData && nodes.length === 0) {
    return <Typography>Loading dummy nodes...</Typography>;
  }

  if (!useDummyData && loading && nodes.length === 0) {
    return <Typography>Connecting to mesh node via TCP...</Typography>;
  }

  if (nodes.length === 0) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography>No nodes available.</Typography>
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
          node.node_num ??
          node.node_id ??
          node.nodeId ??
          node.id ??
          node.ip ??
          `node-${idx}`;
        return (
          <NodeDetails
            key={stableId}
            node={node}
            expanded={expandedNodeId === stableId}
            onToggle={() => handleToggle(stableId)}
            useDummyData={useDummyData}
          />
        );
      })}

    </Box>
  );
}
