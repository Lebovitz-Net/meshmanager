import mqtt from 'mqtt';
import { decodeAndNormalize } from './packetDecoders.js';
import { processLocalPacket } from './meshBridge.js';

const MQTT_BROKER_URL = 'mqtt://broker.hivemq.com';
const MQTT_SUB_TOPIC = 'meshtastic/node/+/+';

const client = mqtt.connect(MQTT_BROKER_URL);

client.on('connect', () => {
  console.log(`[MQTT] Connected to broker at ${MQTT_BROKER_URL}`);
  client.subscribe(MQTT_SUB_TOPIC, (err) => {
    if (err) console.error('[MQTT] Subscription error:', err.message);
    else console.log(`[MQTT] Subscribed to topic: ${MQTT_SUB_TOPIC}`);
  });
});

client.on('message', (topic, message) => {
  const packet = decodeAndNormalize(message, 'mqtt');
  if (!packet || packet.type === 'Unknown') return;
  packet.source = 'mqtt';
  processLocalPacket(packet);
});

export function publishToMQTT(packet) {
  if (packet?.source === 'mqtt') return;
  if (!packet?.nodeId || !packet?.type || packet.type === 'Unknown') return;

  const topic = `meshtastic/node/${packet.nodeId}/${packet.type.toLowerCase()}`;
  client.publish(topic, JSON.stringify(packet), { qos: 0, retain: false });
  console.log(`[MQTT] Published to ${topic}`);
}
