import { useEffect } from 'react';

const fallbackErrorHandler = (e) => {
  const errorInfo = {
    type: e?.type || 'error',
    message: 'WebSocket error occurred',
    raw: e
  };
  console.warn('[useBridgeLifecycle] Fallback error handler:', errorInfo);
};

export function useBridgeLifecycle({
  active,
  connect,
  close,
  addListener,
  removeListener,
  handlers = {},
  connectionId = 'unknown'
}) {
    useEffect(() => {
        if (active) connect();
        else close();
    }, [active]);

    useEffect(() => {
        if (handlers.onMessage) {
        addListener(handlers.onMessage);
        return () => removeListener(handlers.onMessage);
        }
    }, [handlers.onMessage]);

    useEffect(() => {
        if (handlers.onOpen) handlers.onOpen();
    }, [handlers.onOpen]);

    useEffect(() => {
        if (handlers.onClose) handlers.onClose();
    }, [handlers.onClose]);

    // Fallback listener: only runs when handlers.onError is undefined
    useEffect(() => {
        if (handlers.onError) {
            addListener(handlers.onError);
            return () => removeListener(handlers.onError);
        } else {
            throw "missing OnError";
        }
    }, [handlers?.onError, connectionId]);
}
