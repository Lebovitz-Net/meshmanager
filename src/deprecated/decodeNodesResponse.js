import { getMessageType } from '@/utils/protoDescriptor';

export function decodeNodeInfoPackets(buffers) {

  const MeshPacket = getMessageType('meshtastic.MeshPacket');

  if (!MeshPacket) {
    console.warn('❌ MeshPacket type not found in proto descriptor');
    return [];
  }

  return buffers
    .map((buf) => {
      try {
        return MeshPacket.decode(buf);
      } catch (err) {
        console.warn('⚠️ Failed to decode packet:', err);
        return null;
      }
    })
    .filter(Boolean)
    .filter((pkt) => pkt.decoded?.admin?.hasNodeInfo)
    .map((pkt) => {
      const info = pkt.decoded.admin.nodeInfo;
      return {
        id: info.user?.id || 'unknown',
        name: info.user?.longName || 'unnamed',
        lat: info.position?.latitude ?? null,
        lon: info.position?.longitude ?? null,
        alt: info.position?.altitude ?? null,
        timestamp: info.position?.time ?? null,
      };
    });
}
