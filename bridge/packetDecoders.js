import protobuf from 'protobufjs';
import protoJson from '../src/assets/proto.json' with { type: 'json' };
import { normalizeBuffers } from './bufferUtils.js'; // assuming you extract it

let root;
let MeshPacket, FromRadio, NodeInfo, Telemetry, DeviceMetrics;

export async function initProtoTypes() {
  root = protobuf.Root.fromJSON(protoJson);
  MeshPacket = root.lookupType('meshtastic.MeshPacket');
  FromRadio = root.lookupType('meshtastic.FromRadio');
  NodeInfo = root.lookupType('meshtastic.NodeInfo');
  Telemetry = root.lookupType('meshtastic.Telemetry');
  DeviceMetrics = root.lookupType('meshtastic.DeviceMetrics');
  console.log('[Proto Init] Protobuf types initialized');
}

export function stripFramingHeader(buf) {
  return buf?.[0] === 0x94 && buf?.[1] === 0xc3 ? buf.subarray(2) : buf;
}

export function toNodeIdString(num) {
  return '!' + Number(num >>> 0).toString(16).padStart(8, '0');
}

function tryDecodeBytes(buffer, type, label) {
  try {
    return type.decode(stripFramingHeader(buffer));
  } catch {
    return null;
  }
}

function classifyMeshPacket(mp, source) {
  const fromNum = mp.from ?? null;
  const nodeId = fromNum != null ? toNodeIdString(fromNum) : 'UnknownNode';
  let type = 'MeshPacket';
  let inner = {};

  if (mp.decoded?.portnum !== undefined && mp.decoded?.payload) {
    const res = decodeByPort(mp.decoded.portnum, mp.decoded.payload);
    if (res?.type) type = res.type;
    if (res?.decoded) inner = res.decoded;
  }

  return {
    type,
    from: fromNum,
    fromNum,
    nodeId,
    viaMqtt: !!mp.viaMqtt,
    decoded: inner,
    payload: inner,
    source
  };
}

function decodeByPort(portnum, payload) {
  switch (portnum) {
    case 67: return { type: 'NodeInfo', decoded: tryDecodeBytes(payload, NodeInfo, 'NodeInfo') };
    case 68: return { type: 'Telemetry', decoded: tryDecodeBytes(payload, Telemetry, 'Telemetry') };
    case 69: return { type: 'DeviceMetrics', decoded: tryDecodeBytes(payload, DeviceMetrics, 'DeviceMetrics') };
    default: return null;
  }
}

const packetHandlers = {
  FromRadio: (packet) => packet?.nodeInfo?.user?.id ? packet : null,
  MeshPacket: (packet) => classifyMeshPacket(packet, packet.source || 'tcp')
};

export function decodeAndNormalize(buffer, source = 'tcp') {
  const raw =
    tryDecodeBytes(buffer, FromRadio, 'FromRadio') ||
    tryDecodeBytes(buffer, MeshPacket, 'MeshPacket');

  if (!raw) return { type: 'Unknown', source };

  // Attach metadata
  raw.type = raw.constructor?.name || 'Unknown';
  raw.source = source;

  return normalizeBuffers(raw);
}
