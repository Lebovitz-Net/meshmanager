import { useRef, useState, useEffect } from 'react';
import { addListener, removeListener, emit } from '@/utils/eventUtils';

export function useSocketInterface({ url, binary = false, active }) {

  const socketRef = useRef(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'connecting' | 'open' | 'error' | 'closed'

  // Tagging + history tracking
  const connectionCounterRef = useRef(0);
  const currentTagRef = useRef(null);
  const wasOpenedRef = useRef(false);

  const updateStatus = (next) => {
    setStatus(next);
  };

  const connect = () => {
    if (socketRef.current) return;

    const tag = ++connectionCounterRef.current;
    currentTagRef.current = tag;
    wasOpenedRef.current = false;
    updateStatus('connecting');

    const ws = new WebSocket(url);
    ws.binaryType = binary ? 'arraybuffer' : 'blob';

    ws.onopen = () => {
      console.log(`[TAG ${tag}] OPEN`);
      socketRef.current = ws;
      wasOpenedRef.current = true;
      updateStatus('open');
      emit('socket', 'open', { type: 'open' });
    };

    ws.onmessage = (e) => {
      const data = binary ? new Uint8Array(e.data) : e.data;
      emit('socket', 'message', data);
    };

    ws.onerror = (e) => {
      console.error(`[TAG ${tag}] ERROR`, e);
      updateStatus('error');
      emit('socket', 'error', {
        type: e?.type || 'error',
        message: 'WebSocket error occurred',
        raw: e
      });
    };

    ws.onclose = (e) => {
      console.log(`[TAG ${tag}] CLOSE code=${e?.code} reason=${e?.reason} wasClean=${e?.wasClean}`);
      updateStatus('closed');
      emit('socket', 'close', {
        type: 'close',
        code: e?.code,
        reason: e?.reason
      });
    };
  };

  const send = (data) => {
    const ws = socketRef.current;
    const ready = ws?.readyState;
    const tag = currentTagRef.current;

    console.log(`[TAG ${tag}] SEND ATTEMPT`, {
      ready,
      wasOpened: wasOpenedRef.current,
      status
    });

    if (ready === WebSocket.OPEN) {
      const payload = data;
      console.log(`[TAG ${tag}] SEND`, payload);
      ws.send(payload);
    } else {
      console.warn(
        `[TAG ${tag}] Socket not open, send skipped — ${wasOpenedRef.current ? 'was open earlier' : 'never opened'}`
      );
    }
  };

  const close = () => {
    const tag = currentTagRef.current;
    if (socketRef.current) {
      console.log(`[TAG ${tag}] MANUAL CLOSE CALLED`);
      socketRef.current.close();
      socketRef.current = null;
      updateStatus('closed');
    }
  };

  return {
    connect,
    close,
    send,

    status
  };
}
