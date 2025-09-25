export function insertConfig({ timestamp, type, payload }) {
  db.prepare(`
    INSERT INTO config (
      timestamp, type, payload
    ) VALUES (
      @timestamp, @type, @payload
    )
  `).run({
    timestamp,
    type,
    payload: JSON.stringify(payload)
  });
}
