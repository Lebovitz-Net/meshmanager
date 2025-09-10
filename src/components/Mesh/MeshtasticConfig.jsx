import.meta.env.VITE_API_BASE_URL
const meshtasticConfig = {
  ip: '192.168.2.79',
  port: 4403,
  protoPath: '/fromradio.proto', // Adjust path if bundling for browser
  defaultDestinationId: 0xffffffff,
};

export default meshtasticConfig;
