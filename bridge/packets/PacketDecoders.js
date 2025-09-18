export function decodePacket(packet) {
  if (!packet || typeof packet !== 'object') return null;

  const nodeInfo = {
    id: packet.nodeId ?? packet.id ?? packet.user?.id ?? packet.ip,
    longName: packet.longName ?? packet.user?.longName ?? '',
    shortName: packet.shortName ?? packet.user?.shortName ?? '',
    hwModel: packet.hwModel ?? packet.hardwareModel ?? '',
    owner: packet.owner ?? packet.user?.owner ?? '',
    source: packet.source ?? '',
    packetType: packet.packetType ?? packet.type ?? '',
    battery: packet.battery ?? packet.status?.battery,
    certTrusted: packet.certTrusted ?? packet.status?.certTrusted,
    updated: packet.timestamp ? new Date(packet.timestamp).getTime() : Date.now(),
    position: {
      latitudeI: packet.position?.latitudeI ?? packet.position?.latitude,
      longitudeI: packet.position?.longitudeI ?? packet.position?.longitude,
      altitude: packet.position?.altitude ?? packet.alt
    }
  };

  return { nodeInfo };
}
