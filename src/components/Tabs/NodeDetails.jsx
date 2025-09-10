import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import { useMeshSocketBridge } from '@/hooks/useMeshSocketBridge.js';
import { useNodeSubscription } from '@/hooks/useNodeSubscription.js';
import { getWSUrl } from '@/utils/config';
import { handlePacket } from '@/utils/handlePacket.js';


export default function NodeDetails({
  node,
  expanded = false,
  onToggle,
  useDummyData = false
}) {
  if (!node) return null;

  const [messages, setMessages] = useState([]);
  const [debouncedActive, setDebouncedActive] = useState(false);
  const lastExpanded = useRef(expanded);

  const packetHandler = useCallback(
    (packet) => handlePacket(packet, node?.id, setMessages),
    [node?.id]
  );

  // Debounce expand to avoid rapid toggle churn
  useEffect(() => {
    if (expanded !== lastExpanded.current) {
      lastExpanded.current = expanded;
      const t = setTimeout(() => setDebouncedActive(expanded), 200);
      return () => clearTimeout(t);
    }
  }, [expanded]);

  const handleMessage = useCallback((data) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      setMessages((prev) => [...prev, parsed]);
    } catch (e) {
      console.warn('[NodeDetails] Failed to parse incoming message', e);
    }
  }, []);

  const handleOpen = useCallback(() => {
    if (useDummyData) {
      setMessages((prev) => [
        ...prev,
        {
          position: {
            latitude: 42.0,
            longitude: -71.0,
            speed: 0,
            heading: 0,
            dop: 1.0
          },
          battery: 95
        }
      ]);
    }
  }, [useDummyData]);

  const handleError = useCallback((err) => {
    const reason = err?.message || err?.type || 'Unknown WebSocket error';
    console.error('[NodeDetails] WebSocket error:', reason, err?.raw || err);
  }, []);

  const handleClose = useCallback(() => {
    console.log('[NodeDetails] WebSocket closed');
  }, []);

  const nodeDetailsHandlers = useMemo(() => ({
      onOpen: handleOpen,
      onMessage: handleMessage,
      onError: handleError,
      onClose: handleClose
  }), []);

  const shouldConnect = useMemo(() => {
    return debouncedActive && !!node?.id;
  }, [debouncedActive, node?.id]);

  const nodeKey = node.id ?? node.nodeId ?? node.node_id ?? node.ip;
  const { status, send } = useMeshSocketBridge({
    url: nodeKey ? getWSUrl(nodeKey) : undefined,
    binary: false,
    active: shouldConnect && !!nodeKey,
    idleMs: 5000,
    handlers: nodeDetailsHandlers
  });


  useNodeSubscription({
    nodeId: node.id,
    active: shouldConnect,
    status,
    send,
    onPacket: packetHandler
  });


  const latest = messages.length > 0 ? messages[messages.length - 1] : {};
  const {
    longName,
    shortName,
    id,
    channel,
    battery,
    hardwareModel,
    lastHeard,
    hopsAway,
    viaMqtt,
    lat,
    lon,
    alt
  } = node;

  const formattedLastHeard = lastHeard
    ? new Date(lastHeard * 1000).toLocaleString()
    : 'Unknown';

    console.log('[NodeDetails] node:', node);
    console.log('[NodeDetails] longName:', longName, 'shortName:', shortName);


  return (
    <Box mt={2} p={2} border={1} borderRadius={2} borderColor="grey.300">
      <Typography
        variant="h6"
        gutterBottom
        sx={{ cursor: 'pointer' }}
        onClick={onToggle}
      >
        {longName || shortName || id || 'Unnamed Node'}
      </Typography>

      {channel && <Typography variant="body2">Channel: {channel}</Typography>}
      <Typography variant="body2">Status: {status}</Typography>
      {hardwareModel && (
        <Typography variant="body2">Hardware: {hardwareModel}</Typography>
      )}
      {battery != null && (
        <Typography variant="body2">Battery: {battery}%</Typography>
      )}
      <Typography variant="body2">Last Heard: {formattedLastHeard}</Typography>
      {hopsAway != null && (
        <Typography variant="body2">Hops Away: {hopsAway}</Typography>
      )}
      {viaMqtt != null && (
        <Typography variant="body2">
          Via MQTT: {viaMqtt ? 'Yes' : 'No'}
        </Typography>
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
      {alt != null && <Typography variant="body2">Altitude: {alt} m</Typography>}

      <Collapse in={expanded} timeout="auto" unmountOnExit>
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
