Packets
| Portnum | Application Name             | Data Type / Protobuf Message     | Description                                      |
|---------|------------------------------|----------------------------------|--------------------------------------------------|
| 1       | TEXT_MESSAGE_APP             | TextMessage                      | UTF-8 chat messages                              |
| 2       | REMOTE_HARDWARE_APP          | HardwareMessage                  | GPIO control, remote pin toggling                |
| 3       | POSITION_APP                 | Position                         | GPS coordinates, altitude, speed                 |
| 4       | NODEINFO_APP                 | User                             | Node metadata: name, firmware, hardware          |
| 6       | CHANNEL_APP                  | Channel                          | Channel config: PSK, modem settings              |
| 7       | TEXT_MESSAGE_COMPRESSED_APP  | TextMessage (Unishox2)           | Compressed chat messages                         |
| 65      | STORE_FORWARD_APP            | StoreAndForward                  | Message history, replay, stats                   |
| 66      | RANGE_TEST_APP               | ASCII Payload                    | Signal strength testing                          |
| 67      | TELEMETRY_APP                | Telemetry                        | Sensor data: temp, humidity, battery, etc.       |
| 68–127  | Third-party / Custom Apps    | Varies                           | Vendor-specific or extended functionality        |
| 128–255 | Reserved / Internal          | Varies                           | Experimental or internal use                     |

Format of a variant
```json
FromRadio {
   packet: MeshPacket {
    from: 1262801593,
    to: 4294967295,
    decoded: Data {
      portnum: 3,
      payload: <Buffer 0d 00 00 ef 0b 15 00 00 37 a3 18 be 06 25 ff 48 cb 68 28 02 58 82 02 78 00 80 01 f0 fc d7 04 98 01 05 b8 01 0f>,
      bitfield: 1
    },
    id: 238272157,
    rxTime: 1758152959,
    viaMqtt: true,
    hopStart: 7
  },
  type: 'FromRadio',
  source: 'tcp',
  connId: 'default'
}
```

## Config packets
Config tables
| Config Type   | Protobuf Message     | Description                                                                 |
|---------------|----------------------|------------------------------------------------------------------------------|
| `device`      | `DeviceConfig`       | Controls node broadcast interval and timezone settings                      |
| `position`    | `PositionConfig`     | Manages GPS update rate, smart broadcast logic, and fixed position flag     |
| `power`       | `PowerConfig`        | Defines sleep/wake timing, Bluetooth wait, and low-power scheduling         |
| `network`     | `NetworkConfig`      | Wi-Fi SSID/PSK, NTP server, and protocol enablement                         |
| `display`     | `DisplayConfig`      | Sets screen timeout duration                                                |
| `lora`        | `LoRaConfig`         | Region, hop limit, TX power, boosted gain, and preset usage                |
| `bluetooth`   | `BluetoothConfig`    | Enables Bluetooth, sets mode and fixed PIN                                  |
| `security`    | `SecurityConfig`     | Public/private keys, admin key, serial port enablement                      |
| `sessionkey`  | `SessionkeyConfig`   | Session-level encryption (used for secure routing)                          |
| `deviceUi`    | `DeviceUIConfig`     | UI-specific settings (e.g. screen layout, button behavior)                  |

example

```json
FromRadio {
  config: Config {
    security: SecurityConfig {
      adminKey: [],
      publicKey: <Buffer 4b 04 bf b5 b3 32 cc e8 59 71 62 72 fc 60 88 8f b0 5e 5b bb 41 f0 0e 34 71 b6 ef dd 15 04 e7 25>,
      privateKey: <Buffer 58 75 e6 49 7d 5e 11 e4 9e 29 ac 41 c7 54 a1 49 2c 1f 44 f1 d6 4d bc 8a eb 96 1c 2c 08 e7 a2 61>,
      serialEnabled: true
    }
  },
  type: 'FromRadio',
  source: 'tcp',
  connId: 'default'
}
```

ModuleConfig


| Module Name           | Protobuf Message               | Description                                                                 |
|-----------------------|--------------------------------|-----------------------------------------------------------------------------|
| `mqtt`                | `MQTTConfig`                   | MQTT broker settings for cloud sync, map reporting, encryption              |
| `serial`              | `SerialConfig`                 | RX/TX pin mapping and baud rate for serial communication                   |
| `externalNotification`| `ExternalNotificationConfig`   | Triggers for external alerts (e.g. buzzers, LEDs)                           |
| `storeForward`        | `StoreForwardConfig`           | Enables message caching and replay across nodes                            |
| `rangeTest`           | `RangeTestConfig`              | Configures signal strength testing between nodes                           |
| `telemetry`           | `TelemetryConfig`              | Enables environmental sensor reporting (temp, humidity, etc.)              |
| `cannedMessage`       | `CannedMessageConfig`          | Predefined messages for quick transmission                                 |
| `audio`               | `AudioConfig`                  | Audio input/output settings (e.g. mic/speaker control)                     |
| `remoteHardware`      | `RemoteHardwareConfig`         | GPIO pin availability for remote control                                   |
| `neighborInfo`        | `NeighborInfoConfig`           | Tracks nearby nodes and link quality                                       |
| `ambientLighting`     | `AmbientLightingConfig`        | RGB lighting control based on ambient conditions                           |
| `detectionSensor`     | `DetectionSensorConfig`        | Motion or presence detection triggers                                      |
| `paxcounter`          | `PaxcounterConfig`             | Counts nearby Wi-Fi/Bluetooth devices for crowd sensing                    |

```json
FromRadio {
  moduleConfig: ModuleConfig {
    ambientLighting: AmbientLightingConfig {
      current: 10,
      red: 12,
      green: 224,
      blue: 56
    }
  },
  type: 'FromRadio',
  source: 'tcp',
  connId: 'default'
}
```

MyInfo

```json
 FromRadio {
  myInfo: MyNodeInfo {
    myNodeNum: 3758940216,
    rebootCount: 185,
    minAppVersion: 30200,
    deviceId: <Buffer 7e cf ce bd e7 12 2c ba 8e 7d 67 0a fb 0f 71 29>,
    pioEnv: 'heltec-v3'
  },
  type: 'FromRadio',
  source: 'tcp',
  connId: 'default'
}
```

Channel

```json
 FromRadio {
  channel: Channel {
    index: 1,
    settings: ChannelSettings {
      channelNum: 1,
      psk: <Buffer 6b 4f 75 6e 36 6e 53 39 78 75 54 62 61 48 66 4e 4c 4e 44 75 52 4c 69 5a 72 66 42 50 6b 32 4c 43>,
      name: 'kd1mu',
      uplinkEnabled: true,
      downlinkEnabled: true,
      moduleSettings: [ModuleSettings]
    },
    role: 2
  },
  type: 'FromRadio',
  source: 'tcp',
  connId: 'default'
}
```


DeviceuiConig

```json
FromRadio {
  deviceuiConfig: DeviceUIConfig { screenBrightness: 153, screenTimeout: 30 },
  type: 'FromRadio',
  source: 'tcp',
  connId: 'default'
}
```

FileInfo

| File Name                | Size (Bytes) | Description                                                  |
|--------------------------|--------------|--------------------------------------------------------------|
| `/prefs/channels.proto` | 114          | Stores channel definitions and PSK settings                  |
| `/prefs/config.proto`   | 242          | Contains node-wide configuration (e.g. power, network)       |
| `/prefs/device.proto`   | 122          | Device-specific settings (e.g. broadcast interval, timezone) |
| `/prefs/module.proto`   | 110          | Module enablement and settings (e.g. MQTT, telemetry)        |
| `/prefs/nodes.proto`    | 22281        | Cached node metadata (e.g. NodeInfo, longName, hardware)     |

```json
 FromRadio {
  fileInfo: FileInfo { fileName: '/prefs/module.proto', sizeBytes: 110 },
  type: 'FromRadio',
  source: 'tcp',
  connId: 'default'
}
```

End of getConfig Resquest

```json
FromRadio {
  configCompleteId: 1,
  type: 'FromRadio',
  source: 'tcp',
  connId: 'default'
}
```

Queue Status

```json
FromRadio {
  queueStatus: QueueStatus { free: 16, maxlen: 16 },
  type: 'FromRadio',
  source: 'tcp',
  connId: 'default'
}
```

PKI Encryption information

🔐 What This Packet Represents
pkiEncrypted: true Indicates the payload was encrypted using public key infrastructure—likely destined for a specific node that can decrypt it with its private key.

wantAck: true Signals that the sender expects an acknowledgment (ACK) if the packet is successfully received and decrypted.

decoded.payload: <Buffer ...> This is still raw encrypted data—you’re seeing the ciphertext, not a decoded protobuf message.

🧠 Why It’s Different
Most packets you’ve logged are either:

Unencrypted and decoded into TextMessage, Telemetry, Config, etc.

Locally emitted via FromRadio with clear protobuf types

This one is:

Mesh-routed

Encrypted for a specific recipient

Not yet decrypted by your bridge server, unless you hold the private key

✅ What You Can Do
If your bridge server is configured with the appropriate private key, you can attempt decryption like this:

```js
const decrypted = decryptWithPrivateKey(meshPacket.decoded.payload);
const decodedMessage = decodeProtobuf(decrypted); // e.g. TextMessage, Config, etc.
Otherwise, you can log it as an opaque encrypted packet:
```
```js
logEncryptedPacket({
  from: meshPacket.from,
  id: meshPacket.id,
  hopLimit: meshPacket.hopLimit,
  delayed: meshPacket.delayed,
  rxRssi: meshPacket.rxRssi,
  rxSnr: meshPacket.rxSnr,
  timestamp: meshPacket.rxTime,
  connId: fromRadio.connId,
  source: fromRadio.source
});
```

```json
MeshPacket {
  pkiEncrypted: true,
  wantAck: true,
  from: 845308961,
  rxRssi: 101,
  rxTime: 20987176,
  hopLimit: 7,
  delayed: 108,
  viaMqtt: true,
  decoded: Data {
    payload: <Buffer db 2b 28 50 28 2b 42 20 f3 00 7a c0 e7 39 fd 63 8f 11 95 f9 a0 d1 46 b7 2d 8c 11 36 af bc 49 0a 8c 03 a9 bc a2 ba 55 2e 48 00 1a 13 0d 00 00 5c 18 15 ... 31 more bytes>
  },
  rxSnr: 5.780992276100097e+37,
  type: 'MeshPacket',
  source: 'tcp',
  connId: 'default'
}
```

Meta Data about the device

includes the device name represented as a number

| hwModel ID | Device Name                  | Description / Notes                                 |
|------------|------------------------------|-----------------------------------------------------|
| 0          | Unknown                      | Default fallback if model is not detected           |
| 1          | Heltec V1                    | Original ESP32 LoRa board with OLED                 |
| 2          | Heltec V2                    | Updated version with better power management        |
| 3          | T-Beam V1.0                  | LilyGO T-Beam with GPS and battery connector        |
| 4          | T-Beam V1.1                  | Improved GPS and power circuitry                    |
| 5          | T-Echo                       | Compact ESP32-based board with display              |
| 6          | RAK4631                      | nRF52-based board with SX1262 LoRa chip             |
| 7          | WisBlock Base + RAK4631      | Modular RAK system with LoRa and sensors            |
| 8          | T-Echo V2                    | Updated version with better display and power       |
| 9          | T-Beam V1.2                  | Latest T-Beam revision with USB-C                   |
| 10         | Heltec V3                    | ESP32-S3 based board with SX1262                    |
| 43         | Heltec V3 (confirmed)        | Matches your metadata packet—ESP32-S3, SX1262       |


```json
 FromRadio {
  metadata: DeviceMetadata {
    firmwareVersion: '2.6.11.60ec05e',
    deviceStateVersion: 24,
    canShutdown: true,
    hasWifi: true,
    hasBluetooth: true,
    hwModel: 43,
    hasPKC: true,
    excludedModules: 1280
  },
  type: 'FromRadio',
  source: 'tcp',
  connId: 'default'
}
```
 Next Steps

 ✅ Next Steps You Could Scaffold
Registry Layer: Map nodeId to known metadata, config completeness, and module support.

Ingestion Router: Route each FromRadio variant to its corresponding table with dry-run safety.

Diagnostic Overlay: Compare excludedModules, firmwareVersion, and file sizes across nodes.

UI Gatekeeper: Use DeviceMetadata and ModuleConfig to conditionally render UI components.

If you want, I can help scaffold the ingestion router next—something like:

```js
function routeFromRadioPacket(packet: FromRadio) {
  if (packet.config) handleConfig(packet);
  else if (packet.moduleConfig) handleModuleConfig(packet);
  else if (packet.fileInfo) handleFileInfo(packet);
  else if (packet.metadata) handleDeviceMetadata(packet);
  else if (packet.queueStatus) handleQueueStatus(packet);
  else if (packet.configCompleteId !== undefined) markConfigComplete(packet);
  else if (packet.packet?.decoded?.portnum !== undefined) routeMeshPacket(packet.packet);
}
```

Schema and tables

a proposed schema that ties together:

Nodes as the central entity

Connections as runtime links

Device metadata as static capabilities

Channels as mesh topology

Config and ModuleConfig as subsystem declarations

🧩 Proposed Relational Schema
🟦 nodes
Stores persistent identity and inferred metadata.

```sql
CREATE TABLE nodes (
  nodeId TEXT PRIMARY KEY,
  longName TEXT,
  shortName TEXT,
  hwModel INTEGER,
  firmwareVersion TEXT,
  lastSeen TIMESTAMP
);```
🟩 connections
Tracks runtime TCP/WebSocket links and ties them to nodes.

```sql
CREATE TABLE connections (
  connId TEXT PRIMARY KEY,
  nodeId TEXT,
  source TEXT,
  status TEXT,
  lastSeen TIMESTAMP,
  FOREIGN KEY (nodeId) REFERENCES nodes(nodeId)
);```
🟨 device_metadata
Captures capabilities and hardware features.

```sql
CREATE TABLE device_metadata (
  nodeId TEXT PRIMARY KEY,
  deviceStateVersion INTEGER,
  canShutdown BOOLEAN,
  hasWifi BOOLEAN,
  hasBluetooth BOOLEAN,
  hasPKC BOOLEAN,
  excludedModules INTEGER,
  FOREIGN KEY (nodeId) REFERENCES nodes(nodeId)
);```
🟪 channels
Stores channel configuration per node.

```sql
CREATE TABLE channels (
  nodeId TEXT,
  channelIndex INTEGER,
  channelNum INTEGER,
  name TEXT,
  pskFingerprint TEXT,
  uplinkEnabled BOOLEAN,
  downlinkEnabled BOOLEAN,
  role INTEGER,
  timestamp TIMESTAMP,
  connId TEXT,
  FOREIGN KEY (nodeId) REFERENCES nodes(nodeId)
);
```
🟫 config
Modular config entries per node.

```sql
CREATE TABLE config (
  nodeId TEXT,
  configType TEXT,
  payload JSON,
  timestamp TIMESTAMP,
  connId TEXT,
  FOREIGN KEY (nodeId) REFERENCES nodes(nodeId)
);
```

🟥 module_config
Module declarations and settings.

```sql
CREATE TABLE module_config (
  nodeId TEXT,
  moduleType TEXT,
  payload JSON,
  timestamp TIMESTAMP,
  connId TEXT,
  FOREIGN KEY (nodeId) REFERENCES nodes(nodeId)
);
```

🧠 Optional Extensions
file_registry: for FileInfo packets

config_sessions: for tracking configCompleteId boundaries

queue_monitor: for QueueStatus diagnostics

packet_log: if you want to retain raw or decoded MeshPacket traffic

This schema gives you:

Referential integrity: every connection and config is tied to a node

Modularity: each domain is stored in its own table

Teachability: future contributors can trace packet → table → UI

Dry-run safety: easy to scaffold inserts and migrations

## 🧩 Storage Layer Terminology

🧑‍💻 User Information
These are entities that describe the mesh participants and their relationships:

nodes: identity, firmware, hardware model

channels: routing roles, encryption fingerprints

connections: session context, source, status

messages / contacts (to be scaffolded): decoded text messages, sender/receiver mapping

These tables are mostly static or slowly changing, and they define the mesh topology and user-facing content.

📊 Metrics
These are time-sensitive, diagnostic-style entities that reflect system health and behavior:

| Table Name         | Purpose                                                                 |
|--------------------|-------------------------------------------------------------------------|
| `packet_log`       | Stores raw packet flow including ACK status, encryption flags, and timestamps. |
| `queue_monitor`    | Tracks queue saturation, free slots, and congestion diagnostics per node. |
| `event_emissions`  | Logs lifecycle events emitted by the bridge server for UI overlays and debugging. |
| `packet_survey`    | Records which packet types were received, decoded, and by which decoder. |
| `device_metrics`   | Captures telemetry like battery level, GPS position, uptime, and sensor data. |

These tables are dynamic, often timestamped, and power UI overlays, alerts, and debugging tools.

🧠 Suggested Schema Grouping
To keep things modular and teachable for future contributors:

S| Schema Group | Tables                                                                 |
|--------------|------------------------------------------------------------------------|
| `user_info`  | `nodes`, `channels`, `connections`, `messages`, `contacts`            |
| `metrics`    | `packet_log`, `queue_monitor`, `event_emissions`, `packet_survey`, `device_metrics` |

You can namespace these in SQLite or Postgres using prefixes or schemas, and expose them via separate API endpoints later.

🔌 API Boundary Preview
When you expose this to the UI:

/user/nodes, /user/channels, /user/messages → for rendering mesh topology and user content

/metrics/packets, /metrics/events, /metrics/queue → for overlays, alerts, and diagnostics

This keeps the UI clean and avoids coupling it to internal DB logic.

Apply Semantic Grouping
You can organize your SQL tables into two logical domains:

1. User Information Tables
These define mesh topology and user-facing content:

```sql
-- nodes, channels, connections, messages, contacts
CREATE TABLE nodes (...);
CREATE TABLE channels (...);
CREATE TABLE connections (...);
CREATE TABLE messages (...);
CREATE TABLE contacts (...);
```
2. Metrics Tables
These track dynamic system behavior and diagnostics:

```sql
-- packet_log, queue_monitor, event_emissions, packet_survey, device_metrics
CREATE TABLE packet_log (...);
CREATE TABLE queue_monitor (...);
CREATE TABLE event_emissions (...);
CREATE TABLE packet_survey (...);
CREATE TABLE device_metrics (...);
```
🧠 Optional Enhancements
If you're using Postgres or another RDBMS that supports schemas, you could formally separate them:

```sql
-- In Postgres
CREATE SCHEMA user_info;
CREATE SCHEMA metrics;

-- Then qualify table creation
CREATE TABLE user_info.nodes (...);
CREATE TABLE metrics.packet_log (...);
```

In SQLite, you can simulate this with table name prefixes:

```sql
CREATE TABLE user_nodes (...);
CREATE TABLE metrics_packet_log (...);
```

🔌 API & Query Benefits
This grouping helps:

Keep your bridge server modular and teachable

Scope queries by domain (SELECT * FROM metrics.packet_log WHERE ...)

Expose clean API boundaries (/user/nodes vs /metrics/packets)

Future-proof for role-based access (e.g. UI only reads user_info, admin reads metrics)

🧑‍💻 messages Table (User Information)
This table captures decoded text messages exchanged across the mesh:

```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  nodeId TEXT,
  connId TEXT,
  sender TEXT,
  receiver TEXT,
  message TEXT,
  rxTime TIMESTAMP,
  portnum INTEGER,
  encrypted BOOLEAN,
  FOREIGN KEY (nodeId) REFERENCES nodes(nodeId),
  FOREIGN KEY (connId) REFERENCES connections(connId)
);
```
sender and receiver can be longnames or node IDs.

portnum helps distinguish between text vs telemetry vs config.

encrypted flags PKI-encrypted messages for UI gating.

You can later scaffold a contacts table to map known aliases or nicknames to node IDs.

📊 device_metrics Table (Metrics)
This table captures telemetry and runtime health:

```sql
CREATE TABLE device_metrics (
  nodeId TEXT,
  connId TEXT,
  timestamp TIMESTAMP,
  batteryLevel REAL,
  voltage REAL,
  uptime INTEGER,
  gpsLat REAL,
  gpsLon REAL,
  altitude REAL,
  airtimeUsed INTEGER,
  FOREIGN KEY (nodeId) REFERENCES nodes(nodeId),
  FOREIGN KEY (connId) REFERENCES connections(connId)
);
```

Supports overlays for battery health, location, and uptime.

airtimeUsed can help visualize congestion or fairness.

You can emit this from packets like DeviceMetricsLog, Position, or Routing.

🔌 API Mapping Preview
Here’s how these tables map to future endpoints:


| Domain       | Endpoint                  | Backed By         |
|--------------|---------------------------|-------------------|
| user_info    | `/user/messages`          | `messages`        |
| metrics      | `/metrics/device/:nod