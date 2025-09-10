import { useState, useEffect } from 'react';
import { useSocketInterface } from '@/hooks//useSocketInterface';
import { useFlowControl } from '@/hooks/useFlowControl';
import { useBridgeLifecycle } from '@/hooks/useBridgeLifecycle';

export function useMeshSocketBridge({
  url,
  binary = false,
  active = true,
  idleMs = 30000,
  handlers = {}
}) {
  const [status, setStatus] = useState('idle');

  const {
    connect,
    send,
    close,
    addListener,
    removeListener
  } = useSocketInterface({ url, binary });

  useBridgeLifecycle({
    active,
    connect: () => {
      setStatus('connecting');
      connect();
      setStatus('connected');
    },
    close: () => {
      close();
      setStatus('closed');
    },
    addListener,
    removeListener,
    handlers
  });

  useFlowControl({
    active,
    idleMs,
    onIdle: () => {
      close();
      setStatus('idle');
    }
  });

  return { status, send };
}
