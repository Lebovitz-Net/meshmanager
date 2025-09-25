# 📡 meshmanager

A modular, protocol-aware backend for managing mesh network telemetry, node metadata, and diagnostic overlays. Built for clarity, maintainability, and future onboarding.

---

## 🚀 Overview

This system ingests packets from mesh radios, MQTT brokers, and WebSocket clients, decodes and enriches them, stores user and diagnostic data, and emits refresh triggers to the UI. It’s designed to be transport-agnostic, teachable, and resilient.

---

## 🧱 Architecture Highlights

- **Modular Handlers**: Each transport (TCP, WebSocket, MQTT) has its own entry point.
- **Centralized Ingestion**: `ingestionRouter.js` handles decoding, enrichment, and dispatch.
- **Transport-Agnostic Core**: Routing and schema validation live in `core/`.
- **Separation of Concerns**: `user_info` and `metrics` are stored and queried independently.
- **Teachable Scaffolds**: Each module is built for clarity and future contributor onboarding.

---

## 🗂️ File Structure

```plaintext
bridge/
├── handlers/                   # Transport entry points + request logic
│   ├── websocketHandler.js
│   ├── tcpHandler.js
│   ├── meshHandler.js
│   ├── mqttHandler.js
│   ├── getNodeInfo.js
│   ├── getMetrics.js
│   └── updateConfig.js
├── packets/                    # Decoding, enrichment, and classification
│   ├── packetDecoder.js
│   ├── packetTypes.js
│   ├── enrichPacket.js
│   └── packetLogger.js
├── core/                       # Routing, schema, and session management
│   ├── router.js
│   ├── schema.js
│   └── connectionManager.js
├── db/                         # Storage layer (user_info + metrics)
│   ├── schema.js
│   ├── insertUserInfo.js
│   ├── insertMetrics.js
│   └── queryHandlers.js
├── api/                        # Future HTTP API exposure
│   ├── userInfoRoutes.js
│   ├── metricsRoutes.js
│   └── configRoutes.js
├── ingestionRouter.js          # Centralized packet ingestion and dispatch
├── websocketEmitter.js         # Emits refresh triggers to UI
```

---

## 🔄 Data Flow

```plaintext
Transport (TCP/WebSocket/MQTT)
  → Handler (meshHandler, mqttHandler, tcpHandler)
    → ingestionRouter
      → packetDecoder → enrichPacket
        → insertUserInfo / insertMetrics
          → websocketEmitter → UI refresh
```

---

## 🧪 Diagnostic Overlays (Planned)

- `packet_survey.js`: Logs decoder coverage and unknown packet types
- `event_emissions.js`: Tracks lifecycle events and anomalies
- `queue_health.js`: Monitors message throughput and congestion

---

## 🛠️ Getting Started

```bash
git clone https://github.com/your-org/meshmanager.git
cd meshmanager
npm install
npm run dev
```

---

## 🤝 Contributing

This project values clarity, modularity, and onboarding ease. If you're adding a new handler, decoder, or diagnostic overlay, please annotate your code and follow the existing folder conventions.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) for details.

---

## 📄 License

MIT — see [`LICENSE.md`](LICENSE.md) for details.
