// server.js
import express from 'express';
import { config } from './src/bridge/config/config.js';
import runtimeConfigRoutes from './src/bridge/routes/runtimeConfigRoutes.js';
import createWebsocketSessionHandler from './src/bridge/handlers/websocketSessionHandler.js';
import createMQTTHandler from './src/bridge/handlers/mqttHandler.js';
import createTCPServer from './src/bridge/handlers/tcpServerHandler.js';
import ingestionRouter from './src/bridge/core/ingestionRouter.js';
import { registerRoutes } from './src/bridge/api/routes.js';
import createMeshHandler from './src/bridge/handlers/meshHandler.js';
import { initProtoTypes } from './src/bridge/packets/packetDecoders.js';
import { shutdown } from './src/utils/servicesManager.js';

await initProtoTypes(); // sets up decode + encode

// --- Mesh connection ---
global.mesh = createMeshHandler(
  'mesh-1',
  process.env.DEVICE_IP || '192.168.1.52',
  process.env.DEVICE_PORT || 4403,
  ingestionRouter.routePacket
);

// --- Express API ---
const app = express();
app.use(express.json());
app.use('/api/v1/config', runtimeConfigRoutes);
app.get('/', (req, res) => res.send('MeshManager v2 is running'));
registerRoutes(app);

// --- Start API Server ---
global.apiServer = app.listen(config.api.port, () => {
  console.log(`🛠 Express server listening on port ${config.api.port}`);
});

// --- WebSocket ---
global.wsServer = createWebsocketSessionHandler({ port: config.websocket.port });

// --- MQTT ---
global.mqttHandler = createMQTTHandler('mqtt-bridge', {
  brokerUrl: config.mqtt.brokerUrl,
  subTopic: config.mqtt.subTopic,
  pubOptions: config.mqtt.pubOptions
});
global.mqttHandler.connect();

// --- TCP Server ---
global.tcpServer = createTCPServer('tcp-bridge', config.tcp.host, config.tcp.port, {
  onConnect: (id) => console.log(`[TCP ${id}] Connected`),
  onFrame: (id, frame) => ingestionRouter.routePacket(frame, { source: 'tcp', connId: id }),
  onError: (id, err) => console.error(`[TCP ${id}] Error:`, err.message),
  onClose: (id) => console.warn(`[TCP ${id}] Closed`)
});

// --- Graceful Shutdown ---
['SIGINT', 'SIGTERM'].forEach(sig => {
  process.on(sig, () => shutdown(sig));
});
