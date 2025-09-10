// packetDecoders.js

import protobuf from 'protobufjs';
import protoJson from '../assets/proto.json' with { type: 'json' };

const START1 = 0x94;
const START2 = 0xc3;

let root;
let MeshPacket;
let FromRadio;
let ToRadio;
let ServiceEnvelope;
let NodeInfo;
let Telemetry;
let Config;
let DeviceMetrics;

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

  if (!MeshPacket || !FromRadio) {
    console.error('[Proto Init] Failed to load MeshPacket or FromRadio');
  } else {
    console.log('[Proto Init] Protobuf types initialized');
  }
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

  const payload = stripFramingHeader(buffer);
  try {
    return type.decode(payload);
  } catch (err) {
    console.warn(`[${label}] Decode failed:`, err.message);
    return null;
  }
}

export function tryDecodeMeshPacket(buffer) {
  return tryDecode(buffer, MeshPacket, 'MeshPacket');
}

export function tryDecodeFromRadio(buffer) {
  return tryDecode(buffer, FromRadio, 'FromRadio');
}

export function tryDecodeToRadio(buffer) {
  return tryDecode(buffer, ToRadio, 'ToRadio');
}

export function tryDecodeServiceEnvelope(buffer) {
  return tryDecode(buffer, ServiceEnvelope, 'ServiceEnvelope');
}

export function tryDecodeNodeInfo(buffer) {
  return tryDecode(buffer, NodeInfo, 'NodeInfo');
}

export function tryDecodeTelemetry(buffer) {
  return tryDecode(buffer, Telemetry, 'Telemetry');
}

export function tryDecodeConfig(buffer) {
  return tryDecode(buffer, Config, 'Config');
}

export function tryDecodeDeviceMetrics(buffer) {
  return tryDecode(buffer, DeviceMetrics, 'DeviceMetrics');
}

export function classifyPacket(buffer) {
  const decoders = [
    { fn: tryDecodeMeshPacket, label: 'MeshPacket' },
    { fn: tryDecodeFromRadio, label: 'FromRadio' },
    { fn: tryDecodeToRadio, label: 'ToRadio' },
    { fn: tryDecodeServiceEnvelope, label: 'ServiceEnvelope' },
    { fn: tryDecodeNodeInfo, label: 'NodeInfo' },
    { fn: tryDecodeTelemetry, label: 'Telemetry' },
    { fn: tryDecodeConfig, label: 'Config' },
    { fn: tryDecodeDeviceMetrics, label: 'DeviceMetrics' },
  ];

  for (const { fn, label } of decoders) {
    const result = fn(buffer);
    if (result) return { type: label, decoded: result };
  }

  return { type: 'Unknown', raw: buffer };
}
