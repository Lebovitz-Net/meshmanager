import { getMessageType } from '../utils/protoDescriptor.js';

const mesh = getMessageType('meshtastic');
console.log(Object.keys(mesh));
