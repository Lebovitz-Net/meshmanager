2025-09-18

# 🧠 MeshManager v2 — Runtime Config & Transport Architecture (Session Summary)

## ✅ Goals Covered
- Bootstrapped WebSocket, MQTT, and TCP transport layers
- Integrated Express server for runtime config API
- Clarified TCP port usage and cultural context
- Scoped `.env` vs `config.js` responsibilities
- Discussed persistence and frontend wiring for tomorrow

---

## 🧱 `server.js` Architecture

```js
import express from 'express';
import { config } from './config.js';
import runtimeConfigRoutes from './routes/runtimeConfigRoutes.js';
import createWebsocketSessionHandler from './handlers/websocketSessionHandler.js';
import createMQTTHandler from './bridge/mqttHandler.js';
import createTCPHandler from './bridge/tcpHandler.js';
import { routePacket } from './core/ingestionRouter.js';

const app = express();
app.use(express.json());
app.use('/api/v1/config', runtimeConfigRoutes);

app.get('/', (req, res) => res.send('MeshManager v2 is running'));
app.listen(config.http.port, () => {
  console.log(`🛠 Express server listening on port ${config.http.port}`);
});

createWebsocketSessionHandler({ port: config.websocket.port });

const mqttHandler = createMQTTHandler('mqtt-bridge', {
  brokerUrl: config.mqtt.brokerUrl,
  subTopic: config.mqtt.subTopic,
  pubOptions: config.mqtt.pubOptions
});
mqttHandler.connect();

createTCPHandler('tcp-bridge', config.tcp.host, config.tcp.port, {
  onConnect: (id) => console.log(`[TCP ${id}] Connected`),
  onFrame: (id, frame) => routePacket(frame, { source: 'tcp', connId: id }),
  onError: (id, err) => console.error(`[TCP ${id}] Error:`, err.message),
  onClose: (id) => console.warn(`[TCP ${id}] Closed`)
});
```

---

## ⚙️ `config.js` Strategy

```js
export const currentIPHost = '192.168.1.52';
export const currentIPPort = 4403;
let currentIP = `${currentIPHost}:${currentIPPort}`;

export const getNodeIP = () => currentIP;
export const setNodeIP = (ip) => { currentIP = ip; };
```

- Defaults are hardcoded for clarity and onboarding
- No `.env` override for device IP—keeps discovery logic clean
- Runtime mutability via `setNodeIP()` for UI integration

---

## 🔌 TCP Port 1337

- Used for incoming TCP frames from mesh nodes or simulators
- Routed via `routePacket()` into ingestion pipeline
- Symbolic port often used in dev environments (“leet” culture)

---

## 🧭 Express Middleware

- `express.json()` is built-in since v4.16.0
- Enables parsing of JSON POST bodies
- No need to generate or install separately

---

## 🗂️ Next Steps (Deferred to Tomorrow)

- Scaffold `ConnectionPanel.jsx` to hit `/api/v1/config/node-ip`
- Add `config.json` fallback for persistence across restarts
- Annotate `config.js` and `runtimeConfigRoutes.js` for onboarding clarity
- Optionally emit diagnostic events for UI overlays

---

## 📝 Notes

- Chat saved manually as `.txt` due to session/account mismatch
- Express is installed and working
- Chat history won’t persist across reboot—manual save confirmed

---

## 🧠 Reminder for Tomorrow

To resume:

> “Let’s pick up the runtime config API work—IP setting via UI.”

I’ll be ready to scaffold the frontend, wire up the POST route, and optionally persist config state.

2025-09-19

## 🛠 Refactor: Unified Insert Handlers & Updated Ingestion Router

### Summary
We removed the old split between `insertUserInfo.js` and `insertMetrics.js` and consolidated **all database write functions** into a single file:  
`src/bridge/db/insertHandlers.js`.

The ingestion pipeline (`ingestionRouter.js`) was updated to import from this unified file, eliminating duplicate imports and making all DB writes easy to find and maintain.

---

### Changes Made
1. **Created `insertHandlers.js`**
   - Merged all insert functions from `insertUserInfo.js` and `insertMetrics.js`:
     - `insertNode`
     - `insertChannel`
     - `insertMessage`
     - `insertConnection`
     - `insertPacketLog`
     - `insertTelemetry`
     - `insertEventEmission`
   - Ensured function names match exactly what the ingestion router calls.
   - Standardized signatures: each insert accepts a plain object with the required fields.
   - Used `INSERT OR REPLACE` where appropriate to avoid duplicate primary key errors.
   - Defaulted timestamps to `Date.now()` if not provided.

2. **Updated `ingestionRouter.js`**
   - Single import from `insertHandlers.js` instead of two separate files.
   - Captured a single `ts` timestamp per packet for consistency across inserts.
   - Added guards to prevent inserting orphaned records without required foreign keys.
   - Preserved existing logic:
     - Decoding via `decodeAndNormalize`
     - Delegating `FromRadio` frames to `routeFromRadio`
     - Broadcasting decoded packets to WebSocket clients

3. **Removed legacy files**
   - `insertUserInfo.js` and `insertMetrics.js` are no longer needed.
   - Any other modules that imported from them should now import from `insertHandlers.js`.

---

### Benefits
- **Single source of truth** for all DB writes.
- **Simpler ingestion imports** — one file, all inserts.
- **Easier onboarding** — contributors can find all write logic in one place.
- **Consistent timestamps** for all inserts from the same packet.
- **Future‑proof** — adding a new insert type only requires updating one file.

---

### Next Steps
- Audit other parts of the codebase for direct imports from the old insert files and update them.
- Consider adding transactions for high‑volume telemetry inserts to improve performance.
- Document the insert function contracts in `CONTRIBUTING.md` for future contributors.
