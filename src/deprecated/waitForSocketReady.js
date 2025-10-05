export async function waitForSocketReady(socketRef, timeoutMs = 3000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const ws = socketRef.current;

      if (!ws) {
        // Wait for assignment
        if (Date.now() - start > timeoutMs) {
          return reject(new Error('WebSocket was never assigned'));
        }
        return setTimeout(check, 50);
      }

      if (ws.readyState === WebSocket.OPEN) {
        return resolve();
      }

      if (Date.now() - start > timeoutMs) {
        return reject(new Error('WebSocket did not open in time'));
      }

      setTimeout(check, 50);
    };

    check();
  });
}