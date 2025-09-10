// bridge/mqttBridge.js
import mqtt from 'mqtt';
import { classifyPacket } from './packetDecoders.js';
import { processLocalPacket } from './meshBridge.js';

// Configure your broker URL and options
const MQTT_BROKER_URL = 'mqtt://broker.hivemq.com';
const MQTT_SUB_TOPIC = 'meshtastic/node/+/+'; // Adjust as needed

const client = mqtt.connect(MQTT_BROKER_URL);

client.on('connect', () => {
  console.log(`[MQTT] Connected to broker at ${MQTT_BROKER_URL}`);
  client.subscribe(MQTT_SUB_TOPIC, (err) => {
    if (err) {
      console.error('[MQTT] Subscription error:', err.message);
    } else {
      console.log(`[MQTT] Subscribed to topic: ${MQTT_SUB_TOPIC}`);
    }
  });
});

client.on('message', (topic, message) => {
  // Decode the incoming MQTT message
  const packet = classifyPacket(message, 'mqtt');

  if (packet.type === 'Unknown') {
    // console.warn('[MQTT] Unknown or undecodable packet from topic:', topic);
    return;
  }

  // Mark as MQTT source to prevent re‑publishing loops
  packet.source = 'mqtt';

  // Forward to MeshBridge for UI/WebSocket dispatch
  processLocalPacket(packet);
});

/**
 * Publish a decoded packet to MQTT.
 * Skips packets that originated from MQTT to avoid loops.
 */
export function publishToMQTT(packet) {
  if (packet?.source === 'mqtt') return; // Prevent loop

  if (!packet?.nodeId || !packet?.type || packet.type === 'Unknown') {
    console.warn('[MQTT] Skipping malformed packet', packet);
    return;
  }

  const topic = `meshtastic/node/${packet.nodeId}/${packet.type.toLowerCase()}`;
  try {
    client.publish(topic, JSON.stringify(packet), { qos: 0, retain: false });
    console.log(`[MQTT] Published to ${topic}`);
  } catch (err) {
    console.error('[MQTT] Publish error:', err.message);
  }
}

/**
 * Process a packet that was flagged as viaMqtt in WebSocket handler.
 * This is called when TCP/WebSocket receives a packet that originated from MQTT.
 */
export function processMqttPacket(packet) {
  publishToMQTT(packet);
}
