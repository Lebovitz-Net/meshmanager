// src/bridge/db/insertFileInfo.js

import db from './dbschema.js';

export function insertFileInfo({
  filename,
  size,
  mime_type,
  description,
  num,
  timestamp,
  conn_id
}) {
  if (!filename || !size || !num) {
    console.warn('[insertFileInfo] Skipped insert: missing required fields', filename, size, num);
    return;
  }

  const stmt = db.prepare(`
    INSERT INTO file_info (
      filename, size, mime_type, description,
      num, timestamp, conn_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    filename,
    size,
    mime_type || null,
    description || null,
    num,
    timestamp,
    conn_id || null
  );
}
