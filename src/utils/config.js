const API_URL = 'https://meshtastic.local';
export default API_URL;

export const currentIPHost= '192.168.1.52';
export const currentIPPort = 4403;
let currentIP = `${currentIPHost}:${currentIPPort}`;
export const currentWSPort = 8080;
export const currentWSHost = 'localhost'
export const currentWsUrl = `ws://${currentWSHost}:${currentWSPort}`;

export const getNodeIP = () => currentIP;
export const setNodeIP = (ip) => { currentIP = ip; };

// export const getWSUrl = (addr = currentWsUrl) => `ws://${addr}`;
export const getApiUrl = (addr) => `http://${currentWsUrl}/api/v1`;

export const knownNodes = [
  { name: 'KD1MU Router', ip: '192.168.2.1' },
  { name: 'Node Alpha', ip: '192.168.2.78' },
  { name: 'Node Bravo', ip: '192.168.2.102' },
];

export function getWSUrl(input) {
  // Already a full WebSocket URL

  if (/^wss?:\/\//.test(input)) {
    return input;
  }

  // Looks like a node ID (e.g., 8 hex chars, optionally prefixed with '!')
  if (/^!?[a-f0-9]{8}$/i.test(input)) {
    const cleanId = input.replace(/^!/, "");
    return `${currentWsUrl}/${cleanId}`;
  }

  // Unexpected format—fallback to default host
  return `${currentWsUrl}`;
}

export const debugLogger = (...args) => console.log(...args);
