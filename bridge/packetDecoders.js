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

function classifyMeshPacket(mp, source) {
  // mp here is already a decoded MeshPacket protobuf object
  const nodeId = mp.from || 'UnknownNode';
  const viaMqtt = !!mp.viaMqtt;

  let type = 'MeshPacket';
  let decodedPayload = mp.decoded || {};

  // If we have a decoded payload with a portnum, try to map it
  if (mp.decoded?.portnum !== undefined && mp.decoded?.payload) {
    const portnum = mp.decoded.portnum;
    const payloadDecoded = decodeByPort(portnum, mp.decoded.payload);

    if (payloadDecoded?.type) {
      type = payloadDecoded.type;
    }
    if (payloadDecoded?.decoded) {
      decodedPayload = payloadDecoded.decoded;
    }
  }

  return {
    type,
    decoded: decodedPayload,
    nodeId,
    viaMqtt,
    source
  };
}

export function classifyPacket(buffer, source = 'tcp') {
  let current = buffer;
  let lastType = 'Unknown';
  let depth = 0;

  while (depth < 5) { // safety limit to avoid infinite loops
    depth++;

    // Try known wrapper types first
    const se = tryDecode(current, ServiceEnvelope, 'ServiceEnvelope');
    if (se?.packet) {
      lastType = 'ServiceEnvelope';
      current = se.packet;
      continue; // unwrap again
    }

    const fr = tryDecode(current, FromRadio, 'FromRadio');
    if (fr?.packet) {
      lastType = 'FromRadio';
      current = fr.packet;
      continue; // unwrap again
    }

    // Try MeshPacket
    const mp = tryDecode(current, MeshPacket, 'MeshPacket');
    if (mp) {
      return classifyMeshPacket(mp, source);
    }

    // Try other top-level types (non-wrappers)
    const otherTypes = [
      { type: 'NodeInfo', decoder: NodeInfo },
      { type: 'Telemetry', decoder: Telemetry },
      { type: 'Config', decoder: Config },
      { type: 'DeviceMetrics', decoder: DeviceMetrics },
      { type: 'ToRadio', decoder: ToRadio }
    ];

    for (const { type, decoder } of otherTypes) {
      const decoded = tryDecode(current, decoder, type);
      if (decoded) {
        return {
          type,
          decoded,
          nodeId: decoded?.from || 'UnknownNode',
          viaMqtt: false,
          source
        };
      }
    }

    // If nothing matched, break
    break;
  }

  // If we get here, we couldn't classify
  return {
    type: lastType || 'Unknown',
    raw: current,
    rawHex: Buffer.isBuffer(current) ? current.toString('hex') : null,
    length: Buffer.isBuffer(current) ? current.length : null,
    source
  };
}
