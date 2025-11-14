import { useState, useEffect, useCallback } from 'react';
import NodeDetails from '@/components/Tabs/NodeDetails';
import { Box, Typography, Button } from '@mui/material';
import { useListNodes } from '@/hooks/useNodes.js';
import useSSE from '@/hooks/useSSE.js';

// Helper to upsert node into array
function upsertNode(nodes, incoming) {
  const index = nodes.findIndex(n => n.nodeNum === incoming.nodeNum);
  if (index === -1) return [...nodes, incoming];
  const updated = [...nodes];
  updated[index] = { ...updated[index], ...incoming };
  return updated;
}

export default function NodesTab({ useDummyData = false }) {
  const [expandedNodeId, setExpandedNodeId] = useState(null);
  const { nodes: rawNodes, loading, error, refetch } = useListNodes();
  const [liveNodes, setLiveNodes] = useState([]);

  const handleToggle = (nodeId) => {
    setExpandedNodeId((prev) => (prev === nodeId ? null : nodeId));
  };

  const refresh = () => refetch();

  // 🔄 Listen for live node updates via SSE
  const handleNodes = useCallback((data) => {
      setLiveNodes(prev => upsertNode(prev, data.node));
  }, []);
  useSSE('node', handleNodes);

  // 🧠 Dummy mode bypass
  if (useDummyData) {
    return <Typography>Dummy data mode active. Bridge disabled.</Typography>;
  }

  // 🧱 Merge raw and live nodes
  const mergedNodes = [...rawNodes, ...liveNodes].reduce((acc, node) => {
    const existing = acc.find(n => n.nodeNum === node.nodeNum);
    if (!existing) return [...acc, node];
    return acc.map(n => n.nodeNum === node.nodeNum ? { ...n, ...node } : n);
  }, []);

  // 🧱 Enrich merged node records
  const nodes = mergedNodes.map((node, idx) => ({
    ...node,
    nodeId: node.nodeNum,
    id: node.userId ?? node.nodeNum,
    name: node.label ?? node.userLongName ?? node.userShortName,
    position: {
      lat: node.positionLat,
      lon: node.positionLon,
      alt: node.positionAlt,
      timestamp: node.positionTimestamp,
    },
  }));

  // 🕰️ Loading state
  if (loading && nodes.length === 0) {
    return <Typography>Connecting to mesh node via TCP...</Typography>;
  }

  // 🚫 Empty state
  if (nodes.length === 0) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography>No nodes received yet.</Typography>
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

  // ✅ Node list
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
        const stableId = node.nodeId ?? node.id ?? `node-${idx}`;
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
