📦 Bridge Packet Decoding Architecture
🧱 Directory Structure
Code
bridge/
├── packets/
│   ├── packetDecoders.js
│   ├── decodeNodeInfo.js
│   ├── decodeTelemetry.js
│   ├── decodeDeviceMetrics.js   ← ✅ Add this
│   ├── decodePosition.js        ← ✅ Add this
│   ├── decodeRouting.js         ← ✅ Add this
│   ├── decodeConfig.js          ← ✅ Add this
│   └── decodeTextMessage.js     ← ✅ Add this
🧩 Missing Decoders to Add
Each decoder accepts a raw protobuf buffer and returns a normalized packet object.

decodeDeviceMetrics.js
js
export function decodeDeviceMetrics(buffer, DeviceMetrics) {
  const decoded = DeviceMetrics.decode(buffer);
  return {
    type: 'DeviceMetrics',
    timestamp: decoded.timestamp || Date.now(),
    payload: {
      batteryLevel: decoded.batteryLevel,
      temperature: decoded.temperature,
      memoryFree: decoded.memoryFree,
      voltage: decoded.voltage
    }
  };
}
decodePosition.js
js
export function decodePosition(buffer, Position) {
  const decoded = Position.decode(buffer);
  return {
    type: 'Position',
    timestamp: decoded.timestamp || Date.now(),
    payload: {
      latitude: decoded.latitude,
      longitude: decoded.longitude,
      altitude: decoded.altitude,
      batteryLevel: decoded.batteryLevel
    }
  };
}
decodeRouting.js
js
export function decodeRouting(buffer, Routing) {
  const decoded = Routing.decode(buffer);
  return {
    type: 'Routing',
    timestamp: decoded.timestamp || Date.now(),
    payload: {
      hopLimit: decoded.hopLimit,
      seenNodes: decoded.seenNodes,
      neighbors: decoded.neighbors
    }
  };
}
decodeConfig.js
js
export function decodeConfig(buffer, Config) {
  const decoded = Config.decode(buffer);
  return {
    type: 'Config',
    timestamp: decoded.timestamp || Date.now(),
    payload: {
      channelSettings: decoded.channelSettings,
      pskFingerprint: decoded.pskFingerprint,
      modemConfig: decoded.modemConfig
    }
  };
}
decodeTextMessage.js
js
export function decodeTextMessage(buffer, TextMessage) {
  const decoded = TextMessage.decode(buffer);
  return {
    type: 'TextMessage',
    timestamp: decoded.timestamp || Date.now(),
    payload: {
      sender: decoded.sender,
      message: decoded.message,
      ack: decoded.ack,
      rxTime: decoded.rxTime
    }
  };
}
🔌 Interface with bridgeAdapter.js
🔁 Flow Summary
Raw packet arrives via TCP/WebSocket

bridgeAdapter.js invokes decodeAndNormalize(buffer, source)

decodeAndNormalize():

Strips framing header

Attempts decode as FromRadio or MeshPacket

If MeshPacket, uses portnum to select decoder from packetDecoders.js

If FromRadio, extracts embedded nodeInfo directly

Normalized packet is returned with:

type

timestamp

payload

nodeId

source

bridgeAdapter.js injects connId and forwards to UI via sendWS('frame', packet)

🧠 Example Forwarding
js
const decoded = decodeAndNormalize(buffer, 'tcp');
sendWS('frame', {
  ...decoded,
  connId
});
🧼 Notes
All decoders assume protobuf types are initialized via initProtoTypes()

packetDecoders.js centralizes decoder logic for maintainability

bridgeAdapter.js acts as the transport-to-UI bridge, injecting connId and forwarding normalized packets
