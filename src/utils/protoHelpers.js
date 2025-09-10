import protobuf from 'protobufjs';
import protoDef from '../assets/proto.json' with { type: 'json' };
import { decodeFrame } from './decodeFrame.js';

const START1 = 0x94;
const START2 = 0xc3;

const root = protobuf.Root.fromJSON(protoDef);

export const ToRadio = root.lookupType('meshtastic.ToRadio');
export const AdminMessage = root.lookupType('meshtastic.AdminMessage');
export const Data = root.lookupType('meshtastic.Data');
export const MeshPacket = root.lookupType('meshtastic.MeshPacket');
export const PortNum = root.lookupEnum('meshtastic.PortNum');
export const FromRadio = root.lookupType('meshtastic.FromRadio');

export const ToRadioType = ToRadio.oneofs.payloadVariant.oneof;

export function frame(bytes, opts = {}) {
  const { includeHeader = true } = opts;
  if (!includeHeader) return bytes;

  const len = bytes.length;
  const header = new Uint8Array([START1, START2, (len >> 8) & 0xff, len & 0xff]);
  const framed = new Uint8Array(header.length + len);
  framed.set(header, 0);
  framed.set(bytes, header.length);
  return framed;
}

export function buildToRadioFrame(fieldName, value, opts = {}) {
  if (!ToRadioType.includes(fieldName)) {
    console.warn(`Invalid fieldName: ${fieldName} not in ToRadio.oneof`);
    return null;
  }

  const toRadioMsg = ToRadio.create({ [fieldName]: value });
  const encoded = ToRadio.encode(toRadioMsg).finish();
  return frame(encoded, opts);
}

export const buildWantConfigIDFrame = () => {
  return buildToRadioFrame('wantConfigId', true);
};

export function extractFramedPayloads(buffer, maxLen = 512) {
  const frames = [];
  let offset = 0;

  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== START1 || buffer[offset + 1] !== START2) {
      offset += 1;
      continue;
    }

    const len = (buffer[offset + 2] << 8) | buffer[offset + 3];
    if (len === 0 || len > maxLen) {
      offset += 1;
      continue;
    }

    if (offset + 4 + len > buffer.length) break;

    const payload = buffer.slice(offset + 4, offset + 4 + len);
    frames.push(payload);

    offset += 4 + len;
  }

  const leftover = buffer.slice(offset);
  return { frames, leftover };
}

export const extractNodeInfoPackets = (buffer, maxLen = 512) => {
  const NodeInfo = root.lookupType('meshtastic.NodeInfo');
  const { frames, leftover } = extractFramedPayloads(buffer, maxLen);
  const packets = frames.flatMap(frame => decodeFrame(frame, 'tcp'));

  const nodes = {};
  for (const packet of packets) {
    if (packet.type === 'FromRadio' && packet.payload?.nodeInfo) {
      let info = packet.payload.nodeInfo;

      if (info instanceof Uint8Array) {
        try {
          info = NodeInfo.decode(info);
        } catch (e) {
          console.warn('[extractNodeInfoPackets] Failed to decode nodeInfo buffer:', e);
          continue;
        }
      }

      const nodeId = info.node_num ?? info.num;
      if (nodeId != null) {
        nodes[nodeId] = {
          longName: info.user?.longName,
          shortName: info.user?.shortName,
          lat: info.user?.position?.latitude,
          lon: info.user?.position?.longitude,
          alt: info.user?.position?.altitude,
          battery: info.user?.batteryLevel,
          lastHeard: info.lastHeard,
          hopsAway: info.hopsAway,
          viaMqtt: info.viaMqtt,
          hardwareModel: info.user?.hwModel,
          id: info.user?.id
        };
      } else {
        console.warn('[extractNodeInfoPackets] nodeInfo missing node identifier:', info);
      }
    }
  }

  return { nodes, leftover };
};

export function extractNodeList(buffer) {
  try {
    const decoded = FromRadio.decode(buffer);
    const nodes = Array.isArray(decoded.nodeInfo) ? decoded.nodeInfo : [];

    return nodes.map((node) => ({
      id: node.user?.id || 'unknown',
      name: node.user?.longName || 'unnamed',
      lat: node.position?.latitude ?? null,
      lon: node.position?.longitude ?? null,
      alt: node.position?.altitude ?? null,
      timestamp: node.position?.time ?? null,
    }));
  } catch (err) {
    console.warn('⚠️ Failed to decode meshtastic.FromRadio.nodeInfo:', err);
    return [];
  }
}

export function buildAdminWantNodesFrame(opts = {}) {
  const admin = AdminMessage.create({ wantNodes: { wantAll: true } });
  const adminBytes = AdminMessage.encode(admin).finish();

  const data = Data.create({
    portnum: PortNum.values.ADMIN,
    payload: adminBytes
  });

  const mesh = MeshPacket.create({
    from: opts.from ?? 0,
    to: opts.to ?? 0,
    channel: opts.channel ?? 0,
    id: opts.id ?? Math.floor(Math.random() * 0xffffffff),
    data
  });

  return buildToRadioFrame('packet', mesh, opts);
}
