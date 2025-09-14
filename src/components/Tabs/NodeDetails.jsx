import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
    nodeNum: node.num,
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
    nodeId: node.nodeId ?? node.id,
    active: debouncedActive,
    onPacket: packetHandler
  });

  const latest = messages[messages.length - 1] || {};
  const now = Date.now();
  const isStale = node.updated ? now - node.updated > 10000 : true;

  const lat = node.position?.latitudeI ?? latest.position?.latitude;
  const lon = node.position?.longitudeI ?? latest.position?.longitude;
  const alt = node.position?.altitude ?? latest.position?.altitude;

  const longName = node.longName ?? node.user?.longName ?? '';
  const shortName = node.shortName ?? node.user?.shortName ?? '';
  const nodeId = node.nodeId ?? node.id ?? node.user?.id;

  return (
    <Box mt={2} p={2} border={1} borderRadius={2} borderColor="grey.300">
      <Typography
        variant="h6"
        gutterBottom
        sx={{ cursor: 'pointer' }}
        onClick={onToggle}
      >
        {longName || shortName || nodeId || 'Unnamed Node'}
      </Typography>

      <Typography variant="body2">Node ID: {nodeId}</Typography>
      {node.hwModel && (
        <Typography variant="body2">Hardware Model: {node.hwModel}</Typography>
      )}
      {node.owner && (
        <Typography variant="body2">Owner: {node.owner}</Typography>
      )}
      {node.source && (
        <Typography variant="body2">Source: {node.source}</Typography>
      )}
      {node.packetType && (
        <Typography variant="body2">Packet Type: {node.packetType}</Typography>
      )}
      {node.battery != null && (
        <Typography variant="body2">Battery: {node.battery}%</Typography>
      )}
      {lat != null && lon != null && (
        <Typography variant="body2">
          Location:{' '}
          <a
            href={`https://maps.google.com/?q=${lat},${lon}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {lat.toFixed(5)}, {lon.toFixed(5)}
          </a>
        </Typography>
      )}
      {alt != null && (
        <Typography variant="body2">Altitude: {alt} m</Typography>
      )}
      <Typography variant="body2">Status: {status}</Typography>
      {isStale && (
        <Typography variant="body2" color="warning.main">
          ⚠️ Node stale (no update in 10s)
        </Typography>
      )}

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box mt={1}>
            {diagnosticPacket ? (
              <pre>{JSON.stringify(diagnosticPacket.packet, null, 2)}</pre>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No diagnostic data available.
              </Typography>
            )}
          </Box>
          <Box mt={1}>
          {latest.position && (
            <>
              <Typography variant="body2">
                Live Latitude: {latest.position.latitude}
              </Typography>
              <Typography variant="body2">
                Live Longitude: {latest.position.longitude}
              </Typography>
              <Typography variant="body2">
                Speed: {latest.position.speed} m/s
              </Typography>
              <Typography variant="body2">
                Heading: {latest.position.heading}°
              </Typography>
              <Typography variant="body2">
                DOP: {latest.position.dop}
              </Typography>
            </>
          )}
          {latest.battery != null && (
            <Typography variant="body2">
              Live Battery: {latest.battery}%
            </Typography>
          )}
          {latest.certTrusted != null && (
            <Typography variant="body2">
              Cert Trust: {latest.certTrusted ? 'Trusted' : 'Unverified'}
            </Typography>
          )}
          {latest.timestamp && (
            <Typography variant="body2">
              Last Update: {new Date(latest.timestamp).toLocaleString()}
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
