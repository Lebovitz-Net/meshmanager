import protobuf from 'protobufjs';
import config from '@/src/components/Mesh/MeshtasticConfig';
import.meta.env.VITE_API_BASE_URL


class MeshtasticClient {
  constructor() {
    this.ip = config.ip;
    this.port = config.port;
    this.protoPath = config.protoPath;
    this.defaultDestinationId = config.defaultDestinationId;
    this.socket = null;
    this.protoRoot = null;
    this.messageType = null;
    this.onMessageCallback = null;
  }

  async init() {
    this.protoRoot = await protobuf.load(this.protoPath);
    this.messageType = this.protoRoot.lookupType('meshtastic.MeshPacket');
  }

  connect(onMessage) {
    this.onMessageCallback = onMessage;
    this.socket = new WebSocket(`ws://${this.ip}:${this.port}/`);
    this.socket.binaryType = 'arraybuffer';

    this.socket.onopen = () => console.log('✅ Connected to Meshtastic node');
    this.socket.onmessage = (event) => this.handleIncoming(event.data);
    this.socket.onerror = (err) => console.error('❌ WebSocket error:', err);
    this.socket.onclose = () => console.log('🔌 Connection closed');
  }

  handleIncoming(buffer) {
    try {
      const decoded = this.messageType.decode(new Uint8Array(buffer));
      const object = this.messageType.toObject(decoded, {
        enums: String,
        longs: String,
        bytes: String,
      });

      if (this.onMessageCallback) {
        this.onMessageCallback(object);
      } else {
        console.log('📨 Received:', object);
      }
    } catch (err) {
      console.error('⚠️ Failed to decode message:', err);
    }
  }

  sendTextMessage(text, destinationId = this.defaultDestinationId) {
    const payload = {
      to: destinationId,
      decoded: {
        portnum: 'TEXT_MESSAGE_APP',
        payload: text,
      },
    };

    const errMsg = this.messageType.verify(payload);
    if (errMsg) throw Error(errMsg);

    const messageBuffer = this.messageType.encode(this.messageType.create(payload)).finish();
    this.socket.send(messageBuffer);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export default MeshtasticClient;
