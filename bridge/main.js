// bridge/main.js
import { initProtoTypes } from './packetDecoders.js';
import createMQTTHandler from './mqttBridge.js';
import createWSServer from './wsServer.js';
import { currentWSPort } from '../src/utils/config.js';

async function startBridge() {
  try {
    console.log('[Startup] Initializing protobuf types...');
    await initProtoTypes();

    console.log('[Startup] Starting WebSocket/TCP bridge...');
    createWSServer({ port: currentWSPort });

    console.log('[Startup] Starting MQTT bridge...');
    const mqtt = createMQTTHandler('mqtt-default', {
      brokerUrl: 'mqtt://broker.hivemq.com',
      subTopic: 'meshtastic/node/+/+'
    });
    mqtt.connect();

    console.log('[Startup] Bridge is up and running 🚀');
  } catch (err) {
    console.error('[Startup] Bridge failed to start:', err);
    process.exit(1);
  }
}

startBridge();
