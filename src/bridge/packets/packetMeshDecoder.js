// src/bridge/packets/packetMeshPacket.js

import protobuf from 'protobufjs';
import protoJson from '../../assets/proto.json' with {type: 'json'}; // Your compiled Meshtastic proto definitions
import { decompress } from '../utils/decompressUtils.js'; // LZ4 decompression
import { parsePlainMessage, extractChannelInfo } from './packetUtils.js';
import { routeMeshDecoded } from '../core/routeMeshDecoded.js';

const root = protobuf.Root.fromJSON(protoJson);
const Position = root.lookupType('meshtastic.Position');
const Telemetry = root.lookupType('meshtastic.Telemetry');
const User = root.lookupType('meshtastic.User');

export function decodeMeshPacket(data) {
  const packet = data.packet;
  const port = packet?.decoded?.portnum;
  const payload = packet?.decoded?.payload;

  if (!port || !payload) return null;

  switch (port) {
    case 1: {
      const message = parsePlainMessage(payload);
      return message
        ? { type: 'Message', message, channelInfo: extractChannelInfo(packet) }
        : null;
    }

    case 7: {
        try {
            const decompressed = decompress(payload);
            if (!decompressed) {
            console.warn('[decodeMeshPacket] Decompression returned null for port 7');
            return null;
            }

            const message = parsePlainMessage(decompressed);
            if (!message) {
            console.warn('[decodeMeshPacket] Failed to parse decompressed message for port 7');
            return null;
            }

            return { type: 'Message', message, channelInfo: extractChannelInfo(packet)};
        } catch (err) {
            console.warn('[decodeMeshPacket] Exception during port 7 decode:', err);
            return null;
        }
    }


    case 3: {
      try {
        const position = Position.decode(payload);
        return { type: 'Position', position: {
            packetId: packet.id,
            fromNodeNum: packet.from,
            toNodeNum: packet.to,
            batteryLevel: position.batteryLevel,
            timestamp: new Date(packet.rxTime * 1000),
            viaMqtt: packet.viaMqtt,
            hopStart: packet.hopStart,
            ...position
        }};
      } catch (err) {
        console.warn('[decodeMeshPacket] Failed to decode Position:', err);
        return null;
      }
    }

    case 4: {
      try {
        const user = User.decode(payload);
        // console.log('[decodeMeshPacket] User', data);
        return { type: 'NodeInfo', user };
      } catch (err) {
        console.warn('[decodeMeshPacket] Failed to decode NodeInfo:', err);
        return null;
      }
    }

    case 5: {
      // Placeholder for AdminMessage packets (PortNum 5)
      // These are control-plane ops like config/channel/owner requests
      return { type: 'AdminMessage', ignored: true };
    }


    case 67: {
      try {
        const telemetry = Telemetry.decode(payload);
        return { type: 'Telemetry', telemetry: {
          fromNodeNum: packet.from,
          toNodeNum: packet.to,
          ...telemetry 
        }};
      } catch (err) {
        console.warn('[decodeMeshPacket] Failed to decode Telemetry:', err);
        return null;
      }
    }

    default:
      console.warn(`[decodeMeshPacket] Unknown port ${port}, skipping`);
      return null;
  }
}
