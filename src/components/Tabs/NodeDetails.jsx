import { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import { useNodeSubscription } from '@/hooks/useNodeSubscription';
import { useNodeDiagnostics } from '@/hooks/useNodeDiagnostics';

export default function NodeDetails({
  node,
  status,
  expanded = false,
  onToggle,
  useDummyData = false
}) {
  const [messages, setMessages] = useState([]);
  const [debouncedActive, setDebouncedActive] = useState(false);
  const lastExpanded = useRef(expanded);

  const packetHandler = useCallback(
    (packet) => setMessages((prev) => [...prev, packet]),
    []
  );

  const { latest: diagnosticPacket } = useNodeDiagnostics({
    nodeNum: node.nodeId,
    packet: messages[messages.length - 1]
  });

  useEffect(() => {
    if (expanded !== lastExpanded.current) {
      lastExpanded.current = expanded;
      const t = setTimeout(() => setDebouncedActive(expanded), 200);
      return () => clearTimeout(t);
    }
  }, [expanded]);

  useNodeSubscription({
    nodeId: node.nodeId,
    status,
    active: debouncedActive,
    onPacket: packetHandler
  });

  const latest = messages[messages.length - 1] || {};
  const now = Date.now();
  const isStale = node.updated ? now - node.updated > 10000 : true;

  const lat = node.position?.lat ?? latest.position?.latitude;
  const lon = node.position?.lon ?? latest.position?.longitude;
  const alt = node.position?.alt ?? latest.position?.altitude;

  const longName = node.userLongName ?? node.longName ?? '';
  const shortName = node.userShortName ?? node.shortName ?? '';
  const nodeId = node.nodeId ?? node.id;

  return (
    <Box mt={2} p={2} border={1} borderRadius={2} borderColor="grey.300">
      {/* Collapsed Summary */}
      <Box onClick={onToggle} sx={{ cursor: 'pointer' }}>
        <Typography variant="h6">
          {shortName} {longName}
        </Typography>
        <Typography variant="body2">NodeNum: {nodeId}</Typography>
        <Typography variant="body2">
          LastHeard: {new Date(node.lastHeard).toLocaleString()}
        </Typography>
        <Typography variant="body2">HopsAway: {node.hopsAway}</Typography>
        <Typography variant="body2">Hardware Model: {node.userHwModel}</Typography>
      </Box>

      {/* Expanded Diagnostics */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box mt={2}>
          {node.position?.lat ? (
            <Typography variant="body2">
              Position: {node.position.lat}, {node.position.lon}, Alt: {node.position.alt} @{' '}
              {new Date(node.position.timestamp).toLocaleString()}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No position data
            </Typography>
          )}
          <Typography variant="body2">Public Key: {node.publicKey}</Typography>
          <Typography variant="body2">
            Messageable: {node.isUnmessagable === 0 ? 'Yes' : 'No'}
          </Typography>

          {/* Live diagnostics from subscription */}
          {diagnosticPacket ? (
            <Box mt={2}>
              <Typography variant="body2">Live Diagnostic Packet:</Typography>
              <pre>{JSON.stringify(diagnosticPacket.packet, null, 2)}</pre>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" mt={2}>
              No diagnostic data available.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
