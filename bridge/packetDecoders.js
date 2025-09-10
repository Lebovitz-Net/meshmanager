// utils/packetDecoders.js
import protobuf from 'protobufjs';
import protoJson from '../src/assets/proto.json' with { type: 'json' };

const START1 = 0x94;
const START2 = 0xc3;

let root;
let MeshPacket, FromRadio, ToRadio, ServiceEnvelope, NodeInfo, Telemetry, Config, DeviceMetrics;

export async function initProtoTypes() {
  root = protobuf.Root.fromJSON(protoJson);

  MeshPacket = root.lookupType('meshtastic.MeshPacket');
  FromRadio = root.lookupType('meshtastic.FromRadio');
  ToRadio = root.lookupType('meshtastic.ToRadio');
  ServiceEnvelope = root.lookupType('meshtastic.ServiceEnvelope');
  NodeInfo = root.lookupType('meshtastic.NodeInfo');
  Telemetry = root.lookupType('meshtastic.Telemetry');
  Config = root.lookupType('meshtastic.Config');
  DeviceMetrics = root.lookupType('meshtastic.DeviceMetrics');

  console.log('[Proto Init] Protobuf types initialized');
}

export function hasFramingHeader(buffer) {
  return buffer.length >= 2 && buffer[0] === START1 && buffer[1] === START2;
}

export function stripFramingHeader(buffer) {
  return hasFramingHeader(buffer) ? buffer.slice(2) : buffer;
}

function tryDecode(buffer, type, label) {
  if (!type) {
    console.warn(`[${label}] Decoder not initialized`);
    return null;
  }
  try {
    return type.decode(stripFramingHeader(buffer));
  } catch {
    return null;
  }
}

function decodeByPort(portnum, payload) {
  switch (portnum) {
    case 67: return { type: 'NodeInfo', decoded: tryDecode(payload, NodeInfo, 'NodeInfo') };
    case 65: return { type: 'Position', decoded: tryDecode(payload, Telemetry, 'Position') };
    case 68: return { type: 'Telemetry', decoded: tryDecode(payload, Telemetry, 'Telemetry') };
    case 69: return { type: 'DeviceMetrics', decoded: tryDecode(payload, DeviceMetrics, 'DeviceMetrics') };
    default: return null;
  }
}

export function classifyPacket(buffer, source = 'tcp') {
  // Try FromRadio first
  const fr = tryDecode(buffer, FromRadio, 'FromRadio');
  if (fr?.packet) {
    const mp = tryDecode(fr.packet, MeshPacket, 'MeshPacket');
    if (mp?.decoded) {
      const payloadDecoded = decodeByPort(mp.decoded.portnum, mp.decoded.payload);
      return {
        type: payloadDecoded?.type || 'MeshPacket',
        decoded: payloadDecoded?.decoded || mp.decoded,
        nodeId: mp.decoded?.from || 'UnknownNode',
        viaMqtt: Boolean(mp.decoded?.viaMqtt),
        source
      };
    }
  }

  // Try MeshPacket directly
  const mp = tryDecode(buffer, MeshPacket, 'MeshPacket');
  if (mp?.decoded) {
    const payloadDecoded = decodeByPort(mp.decoded.portnum, mp.decoded.payload);
    return {
      type: payloadDecoded?.type || 'MeshPacket',
      decoded: payloadDecoded?.decoded || mp.decoded,
      nodeId: mp.decoded?.from || 'UnknownNode',
      viaMqtt: Boolean(mp.decoded?.viaMqtt),
      source
    };
  }

  // Try other top-level types
  const otherTypes = [
    { type: 'ToRadio', decoder: ToRadio },
    { type: 'ServiceEnvelope', decoder: ServiceEnvelope },
    { type: 'NodeInfo', decoder: NodeInfo },
    { type: 'Telemetry', decoder: Telemetry },
    { type: 'Config', decoder: Config },
    { type: 'DeviceMetrics', decoder: DeviceMetrics }
  ];

  for (const { type, decoder } of otherTypes) {
    const decoded = tryDecode(buffer, decoder, type);
    if (decoded) {
      return { type, decoded, nodeId: decoded?.from || 'UnknownNode', viaMqtt: false, source };
    }
  }

  return { type: 'Unknown', raw: buffer, rawHex: buffer.toString('hex'), length: buffer.length, source };
}
