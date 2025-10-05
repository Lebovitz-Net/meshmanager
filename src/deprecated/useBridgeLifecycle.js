import { useEffect } from 'react';

export function useBridgeLifecycle({
  active,
  connect,
  close,
  idleMs = 5000,
  handlers = {}
}) {
  useEffect(() => {
    if (!active) return;

    console.log('[BridgeLifecycle] Activating bridge');
    connect();
    handlers.onOpen?.();

    const idleTimer = setTimeout(() => {
      console.log('[BridgeLifecycle] Idle timeout reached');
      close();
      handlers.onClose?.();
    }, idleMs);

    return () => {
      console.log('[BridgeLifecycle] Deactivating bridge');
      clearTimeout(idleTimer);
      close();
      handlers.onClose?.();
    };
  }, [active]);
}
