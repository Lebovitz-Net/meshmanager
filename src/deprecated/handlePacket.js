import { format } from 'date-fns';
import { debugLogger } from '@/utils/config.js';

export function handlePacket(packet, nodeId, setMessages) {
  if (!packet || typeof packet !== 'object') return;

  const { type, nodeId: packetNodeId, payload } = packet;

  if (packetNodeId !== nodeId) return;

  debugLogger(`[PacketHandler] Received: ${type}`, packet);

  switch (type) {
    case 'NODE_STATUS':
      if (payload?.battery != null) {
        setMessages((prev) => [...prev, {
          battery: payload.battery,
          receivedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        }]);
      }
      break;

    case 'POSITION':
      if (payload?.latitude && payload?.longitude) {
        setMessages((prev) => [...prev, {
          position: payload,
          receivedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        }]);
      }
      break;

    case 'TEXT_MESSAGE':
      // Handle chat or alerts
      break;

    default:
      debugLogger('[PacketHandler] Unhandled type:', type);
  }
}
