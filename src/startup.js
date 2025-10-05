// src/startup.js
export async function startup() {
  try {
    const res = await fetch('/api/v1/myinfo');
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const nodes = await res.json();
    const activeNode = nodes.length > 0 ? nodes[0] : null;
    return { nodes, activeNode };
  } catch (err) {
    console.error('[startup] Failed to load myinfo:', err);
    return { nodes: [], activeNode: null, error: err };
  }
}
