import { MeshPacket, AdminMessage, ToRadio, FromRadio, Data } from './protoHelpers.js'; // assumes shared root

// ✅ Validate raw MeshPacket buffer
export function validateFrame(buffer) {
  try {
    const packet = MeshPacket.decode(buffer);
    const errMsg = MeshPacket.verify(packet);
    return errMsg ? { valid: false, error: errMsg } : { valid: true, packet };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// 🧪 Validate ToRadio → Data → AdminMessage.wantNodes
export function validateAdminWantNodesFrame(buffer) {
  try {
    const packet = MeshPacket.decode(buffer);
    const toRadio = packet.toRadio;
    const data = toRadio?.data;
    const admin = AdminMessage.decode(data?.payload);
    return admin?.wantNodes === true;
  } catch {
    return false;
  }
}

// 🧪 Validate FromRadio → Data → AdminMessage.wantNodes
export function validateEncapsulatedAdminFrame(buffer) {
  try {
    const packet = MeshPacket.decode(buffer);
    const fromRadio = packet.fromRadio;
    const data = fromRadio?.data;
    const admin = AdminMessage.decode(data?.payload);
    return admin?.wantNodes === true;
  } catch {
    return false;
  }
}

// 🧠 Validate decoded packet structure
export function validateDecodedPacket(packet) {
  if (!packet || !packet.raw) return { valid: false, error: 'Missing raw MeshPacket' };

  try {
    const errMsg = MeshPacket.verify(packet.raw);
    return errMsg ? { valid: false, error: errMsg } : { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// 🧩 Validate subtype presence
export function validateSubPacket(packet) {
  if (!packet?.payload) return { valid: false, error: 'Missing payload' };

  switch (packet.type) {
    case 'ToRadio':
      return ToRadio.verify(packet.payload) ? { valid: false, error: 'Invalid ToRadio' } : { valid: true };
    case 'FromRadio':
      return FromRadio.verify(packet.payload) ? { valid: false, error: 'Invalid FromRadio' } : { valid: true };
    case 'Data':
      return Data.verify(packet.payload) ? { valid: false, error: 'Invalid Data' } : { valid: true };
    default:
      return { valid: false, error: `Unknown subtype: ${packet.type}` };
  }
}
