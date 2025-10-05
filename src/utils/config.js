// config.js
// Frontend-safe configuration for meshmanager UI

// === API & WebSocket URLs ===
// These can be overridden via Vite env vars (e.g. VITE_API_URL)
export const API_URL = import.meta.env.VITE_API_URL || 'https://meshtastic.local';

export const currentWSHost = import.meta.env.VITE_WS_HOST || 'localhost';
export const currentWSPort = parseInt(import.meta.env.VITE_WS_PORT || '3000', 10);
export const currentWsUrl = `ws://${currentWSHost}:${currentWSPort}`;

// === Node device connection (used for display/debug only) ===
export const currentIPHost = import.meta.env.VITE_NODE_IP_HOST || '192.168.1.52';
export const currentIPPort = parseInt(import.meta.env.VITE_NODE_IP_PORT || '4403', 10);
let currentIP = `${currentIPHost}:${currentIPPort}`;

// === Utility functions ===
export const getNodeIP = () => currentIP;
export const setNodeIP = (ip) => { currentIP = ip; };

export const getApiUrl = (addr = currentWsUrl) => `http://${addr}/api/v1`;

export const knownNodes = [
  { name: 'KD1MU Router', ip: '192.168.2.1' },
  { name: 'Node Alpha', ip: '192.168.2.78' },
  { name: 'Node Bravo', ip: '192.168.2.102' }
];

export function getWSUrl(input) {
  if (/^wss?:\/\//.test(input)) return input;
  if (/^!?[a-f0-9]{8}$/i.test(input)) {
    const cleanId = input.replace(/^!/, "");
    return `${currentWsUrl}/${cleanId}`;
  }
  return currentWsUrl;
}

export const debugLogger = (...args) => console.log(...args);

// === Unified config object (for UI display/debug only) ===
export const config = {
  api: {
    host: currentWSHost,
    port: currentWSPort
  },
  websocket: {
    host: currentWSHost,
    port: currentWSPort
  },
  node: {
    host: currentIPHost,
    port: currentIPPort
  }
};
