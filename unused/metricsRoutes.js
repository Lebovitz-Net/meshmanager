// api/metricsRoutes.js
import express from 'express';
import {
  getRecentPacketLogs,
  getTelemetryForNode,
  getEventsForNode
} from '../src/bridge/db/queryHandlers.js';

const router = express.Router();

router.get('/node/:id/packets', (req, res) => {
  const { id } = req.params;
  const { limit = 100 } = req.query;
  const logs = getRecentPacketLogs(id, parseInt(limit));
  res.json(logs);
});

router.get('/node/:id/telemetry', (req, res) => {
  const telemetry = getTelemetryForNode(req.params.id);
  res.json(telemetry);
});

router.get('/node/:id/events', (req, res) => {
  const { id } = req.params;
  const { type } = req.query;
  const events = getEventsForNode(id, type);
  res.json(events);
});

export default router;
