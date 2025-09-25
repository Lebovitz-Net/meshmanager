# MeshManager Architecture

MeshManager is a modular ingestion and observability backend for mesh networks. It is designed to support multiple protocols (e.g. Meshtastic, AREDN) and prioritize onboarding clarity, dry-run safety, and future extensibility.

---

## 🧭 Ingestion Flow

Packets arrive decoded and are routed via `routePacket(input, meta)`:

- Extracts fragments: `myInfo`, `metadata`, `config`, `moduleConfig`, `nodeInfo`
- Dispatches each fragment to its corresponding insert handler
- Logs skipped inserts with reasons (e.g. missing `device_id`)
- Broadcasts packet frame via WebSocket

### Routing Logic

| Fragment        | Handler                     | Table               |
|-----------------|-----------------------------|---------------------|
| `myInfo`        | `insertDevice`, `insertDeviceMeta` | `devices`, `device_meta` |
| `metadata`      | `insertDeviceMeta`          | `device_meta`       |
| `config.*`      | `insertDeviceSetting`       | `device_settings`   |
| `moduleConfig.*`| `insertDeviceSetting`       | `device_settings`   |
| `nodeInfo`      | `upsertNodeInfo`            | `nodes`, `users`    |
| `MeshPacket`    | `routeMeshDecoded`          | varies              |
| `telemetry`     | `insertTelemetry`           | `telemetry`         |
| `event`         | `insertEventEmission`       | `event_emissions`   |
| `connection`    | `insertConnection`          | `connections`       |
| `channelInfo`   | `insertChannel`             | `channels`          |
| all packets     | `insertPacketLog`           | `packet_logs`       |

---

## 🧱 Database Schema

MeshManager uses a relational schema with modular insert handlers. All inserts are dry-run safe and use `INSERT OR REPLACE` or `ON CONFLICT DO UPDATE`.

### Device Tables

- `devices`: canonical registry keyed by `device_id`
- `device_meta`: structured metadata (e.g. firmware, pioEnv)
- `device_settings`: normalized config fragments keyed by `config_type`

### Node Tables

- `nodes`, `users`, `channels`, `messages`, `connections`

### Metrics & Logs

- `device_metrics`, `telemetry`, `event_emissions`, `packet_logs`

See [`SCHEMA.md`](./SCHEMA.md) for full schema definitions.

---

## 🌐 API Surface

MeshManager exposes a RESTful API for querying device state and metrics.

### Device Endpoints

- `GET /api/v1/devices` — list all devices
- `GET /api/v1/devices/:device_id` — fetch metadata + config fragments
- `GET /api/v1/devices/:device_id/settings/:config_type` — fetch one config fragment

### Node & Packet Endpoints

- `GET /api/v1/nodes`, `GET /api/v1/packets`, `GET /api/v1/nodes/:id/telemetry`, etc.

All handlers are wrapped in `safe()` for error isolation and dry-run safety.

---

## 🧑‍💻 Contributor Guide

To add support for a new protocol or config type:

1. Extend `insertDeviceSetting()` with new `config_type`
2. Update `routePacket()` to detect and dispatch the fragment
3. Add query handler and API route if needed
4. Document schema changes in `SCHEMA.md`
5. Annotate insert logic for onboarding clarity

All insert handlers live in `src/db/insert/`, query logic in `src/db/queryHandlers.js`, and API routes in `src/bridge/api/routes.js`.

---

## 📚 Related Docs

- [`SCHEMA.md`](./SCHEMA.md) — full database schema
- [`README.md`](./README.md) — project overview and setup
- [`API.md`](./API.md) — sample responses and usage
