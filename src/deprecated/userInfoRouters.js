// api/userInfoRoutes.js
import express from 'express';
import {
  getNodeById,
  getChannelsForNode,
  getMessagesForChannel,
  getConnectionsForNode
} from '../src/bridge/db/queryHandlers.js';

const router = express.Router();

router.get('/node/:id', (req, res) => {
  const node = getNodeById(req.params.id);
  res.json(node || {});
});

router.get('/node/:id/channels', (req, res) => {
  const channels = getChannelsForNode(req.params.id);
  res.json(channels);
});

router.get('/channel/:id/messages', (req, res) => {
  const { id } = req.params;
  const { limit = 50 } = req.query;
  const messages = getMessagesForChannel(id, parseInt(limit));
  res.json(messages);
});

router.get('/node/:id/connections', (req, res) => {
  const connections = getConnectionsForNode(req.params.id);
  res.json(connections);
});

export default router;
