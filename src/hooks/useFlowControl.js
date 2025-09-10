import { useEffect, useRef } from 'react';

export function useFlowControl({ active, idleMs = 30000, onIdle }) {
  const idleTimer = useRef(null);

  useEffect(() => {
    if (active) {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        onIdle?.();
      }, idleMs);
    } else {
      clearTimeout(idleTimer.current);
    }

    return () => clearTimeout(idleTimer.current);
  }, [active, idleMs, onIdle]);
}
