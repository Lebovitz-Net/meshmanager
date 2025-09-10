// src/hooks/useTCPMessages.js
import { getMessageType } from '@/utils/protoDescriptor';

const START1 = 0x94;
const START2 = 0xc3;
const MAX_PACKET_SIZE = 512;

/**
 * Frames a protobuf buffer with Meshtastic TCP header
 * @param {Uint8Array | Buffer} buffer - Encoded protobuf
 * @returns {Buffer} - Framed TCP packet
 */
function frameTCPMessage(buffer) {
  const len = buffer.length;
  if (len > MAX_PACKET_SIZE) {
    throw new Error(`Packet too large: ${len} bytes`);
  }

  return Buffer.concat([
    Buffer.from([START1, START2, (len >> 8) & 0xff, len & 0xff]),
    Buffer.from(buffer),
  ]);
}

/**
 * Hook to send framed protobuf messages over WebSocket
 * @param {React.RefObject<WebSocket>} wsRef
 * @returns {Function} sendFramedMessage(typeName, payload)
 */
export default function TCPMessages(wsRef) {
  function sendFramedMessage(typeName, payload) {
    const MessageType = getMessageType(typeName);
    if (!MessageType) {
      console.warn(`❌ Unknown protobuf type: ${typeName}`);
      return;
    }

    try {
      const encoded = MessageType.encode(payload).finish();
      const framed = frameTCPMessage(encoded);

      if (wsRef?.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(framed);
      } else {
        console.warn('⚠️ WebSocket not connected');
      }
    } catch (err) {
      console.error(`Failed to send ${typeName}:`, err);
    }
  }

  return { sendFramedMessage };
}
