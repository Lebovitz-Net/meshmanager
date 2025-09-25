import { decodeAndNormalize } from '../packets/packetDecoders.js';
import { insertHandlers } from '../db/insertHandlers.js';
import { handleMeshIngestion } from './meshIngestionRouter.js';

const { upsertDeviceIpMap } = insertHandlers;

// --- In-memory cache: source_ip -> { num, device_id }
const ipToDeviceMap = new Map();

/**
 * Load persisted mappings into memory at startup.
 */
export function loadDeviceIpMapCache() {
  const rows = insertHandlers.getAllDeviceIpMappings?.() || [];
  for (const row of rows) {
    ipToDeviceMap.set(row.source_ip, { num: row.num, device_id: row.device_id });
  }
}

/**
 * Learn mapping between sourceIp, num, and device_id.
 * Updates both DB (for persistence) and in-memory cache (for fast lookups).
 */
function learnMapping(sourceIp, num, device_id) {
  if (!sourceIp || !num) return;

  upsertDeviceIpMap({
    source_ip: sourceIp,
    num,
    device_id: device_id || null,
    last_seen: Date.now()
  });

  ipToDeviceMap.set(sourceIp, { num, device_id });
}

/**
 * Resolve mapping from in-memory cache.
 */
function getMapping(sourceIp) {
  return ipToDeviceMap.get(sourceIp) || null;
}

export function routePacket(input, meta = {}) {
  const isBuffer = Buffer.isBuffer(input);
  const packet = isBuffer
    ? decodeAndNormalize(input, meta.source || 'unknown', meta.sourceIp || meta.connId || 'unknown')
    : input;

  if (!packet || packet.type === 'Unknown') return;

  try {
    const ts = Date.now();
    const mapping = getMapping(meta.sourceIp);
    let num = mapping?.num || null;;
    let device_id = mapping?.device_id || null;;
    const conn_id = meta.sourceIp || meta.connId || packet.connId || 'unknown';
    let processed = false;

    if (isBuffer && packet.type === 'FromRadio') {
      const { myInfo, metadata, config, moduleConfig, fileInfo, queueStatus, channel, nodeInfo } = packet;

      // --- Identity branches ---
      if (myInfo) {
        num = myInfo.myNodeNum;
        device_id = myInfo.deviceId || null;
        learnMapping(meta.sourceIp, num, device_id);

        insertHandlers.insertDevice({ num, device_id, conn_id });
        insertHandlers.insertDeviceMeta({
          num,
          device_id,
          reboot_count: myInfo.rebootCount,
          min_app_version: myInfo.minAppVersion,
          pio_env: myInfo.pioEnv,
          conn_id
        });

      } else if (metadata) {
        num = metadata.nodeNum;
        device_id = metadata.deviceId || null;
        learnMapping(meta.sourceIp, num, device_id);

        insertHandlers.insertDeviceMeta({
          num,
          device_id,
          firmware_version: metadata.firmwareVersion,
          hw_model: metadata.hwModel,
          conn_id
        });

      } else  if (fileInfo) {
        if (fileInfo.fileName === undefined)
          console.log('[ingestionRouter] FileInfo no filename', packet);
          insertHandlers.insertFileInfo({
            filename: fileInfo.fileName,
            size: fileInfo.sizeBytes,
            mime_type: fileInfo.mime_type || null,
            description: fileInfo.description || null,
            num,
            device_id,
            timestamp: ts,
            conn_id
          });

      } else if (queueStatus) {
        insertHandlers.insertQueueStatus({
          num,
          device_id,
          res: queueStatus.res,
          free: queueStatus.free,
          maxlen: queueStatus.maxlen,
          mesh_packet_id: queueStatus.meshPacketId || null,
          timestamp: ts,
          conn_id
        });

      } else if (config) {
        const [type, payload] = Object.entries(config)[0];
        // console.log('[routePacket] here are the values', type, JSON.stringify(payload));


      } else if (moduleConfig) {
        for (const [key, value] of Object.entries(moduleConfig)) {

        }
        processed = true;

      } else if (channel) {
        const settings = channel.settings;
        if (settings?.id) {
          insertHandlers.insertChannel({
            channel_id: String(settings.id),
            num,
            device_id,
            index: channel.index || null,
            name: settings.name || null,
            role: String(channel.role),
            psk: settings.psk || null,
            uplink_enabled: settings.uplinkEnabled || false,
            downlink_enabled: settings.downlinkEnabled || false,
            module_settings_json: settings.moduleSettings
              ? JSON.stringify(settings.moduleSettings)
              : null,
            timestamp: ts,
            conn_id
          });
        }
      } else if (nodeInfo) {
        const nodeInfo = packet.nodeInfo;
if (nodeInfo.num === undefined)
  console.log('[ingestionRouter] num missing from nodeInfo', packet);
        const result = insertHandlers.upsertNodeInfo(nodeInfo);

        if (result?.num) {
          num = result.num;
        }

        if (result?.device_id) {
          device_id = result.device_id;
        }

        learnMapping(meta.sourceIp, num, device_id);
      } else if (handleMeshIngestion(packet, num, ts)) {

      } else {
        processed = false;
      };

    } else {
      console.warn('[IngestionRouter] Skipped packet: not FromRadio');
      processed = false
    }

  } catch (err) {
    console.error('[IngestionRouter] Failed to route packet:', err);
  }
}

export default {
  routePacket,
  loadDeviceIpMapCache,
  getMapping,
  learnMapping
};
