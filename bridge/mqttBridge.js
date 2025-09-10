// bridge/mqttBridge.js
import mqtt from 'mqtt';
import { decodeFrame } from '../src/utils/decodeFrame.js';
import { handleDecodedPacket } from './meshBridge.js';

const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
  console.log('[MQTT] Connected');
  client.subscribe('meshtastic/node/+/+');
});

client.on('message', (topic, message) => {
  const packets = decodeFrame(message, 'mqtt');
  packets.forEach(packet => {
    packet.source = 'mqtt';
    handleDecodedPacket(packet);
  });
});

export function publishToMQTT(packet) {
  if (packet?.source === 'mqtt') return;
  if (!packet?.nodeId || !packet?.type || packet.type === 'Unknown') {
    console.warn(`[MQTT] Skipping malformed packet`, packet);
    return;
  }

  const topic = `meshtastic/node/${packet.nodeId}/${packet.type.toLowerCase()}`;
  client.publish(topic, JSON.stringify(packet));
}
