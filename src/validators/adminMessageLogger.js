// validators/adminMessageLogger.js
import protobuf from 'protobufjs';
// import { AdminMessage } from '@/assets/admin_pb'; // adjust path to your compiled proto

export function logAdminMessageStructure(buffer) {
  const reader = protobuf.Reader.create(buffer);
  const log = [];

  while (reader.pos < reader.len) {
    const tag = reader.uint32();
    const fieldNumber = tag >>> 3;
    const wireType = tag & 7;
    const offset = reader.pos;

    let value;
    switch (wireType) {
      case 0: value = reader.uint32(); break;
      case 2:
        const len = reader.uint32();
        value = buffer.slice(reader.pos, reader.pos + len);
        reader.pos += len;
        break;
      case 5: value = reader.fixed32(); break;
      default: value = `Unsupported wireType ${wireType}`;
    }

    log.push({ fieldNumber, wireType, offset, value });
  }

  return log;
}
