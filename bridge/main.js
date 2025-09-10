// bridge/main.js
import { initProtoTypes } from './packetDecoders.js';
import startWebSocketHandler from './websocketHandler.js';
import './mqttBridge.js'; // side-effect: connects to broker and subscribes

async function startBridge() {
  try {
    console.log('[Startup] Initializing protobuf types...');
    await initProtoTypes();

    console.log('[Startup] Starting WebSocket/TCP bridge...');
    startWebSocketHandler();

    console.log('[Startup] MQTT bridge initialized and listening.');
    console.log('[Startup] Bridge is up and running 🚀');
  } catch (err) {
    console.error('[Startup] Bridge failed to start:', err);
    process.exit(1);
  }
}

startBridge();
