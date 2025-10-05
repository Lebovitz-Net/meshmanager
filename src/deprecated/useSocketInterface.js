import { useRef, useState, useEffect } from 'react';
import { emit } from '@/utils/eventUtils';
import { useStateTracker } from './useStateTracker';
import { sendToBridge } from '@/utils/bridgeAdapter.js'; // ⬅️ new import

export function useSocketInterface({ url, binary = false, active }) {
  const socketRef = useRef(null);

  // Tagging + history tracking
  const connectionCounterRef = useRef(0);
  const currentTagRef = useRef(null);
  const wasOpenedRef = useRef(false);

  const {
    protocolState,
    setProtocolState,
    startAckWait,
    resolveAck,
    cancelAllAcks
  } = useStateTracker({ ackTimeoutMs: 5000 });

  const connect = () => {
    if (socketRef.current) return;

    const tag = ++connectionCounterRef.current;
    currentTagRef.current = tag;
    wasOpenedRef.current = false;
    setProtocolState('connecting');

    const ws = new WebSocket(url);
    ws.binaryType = binary ? 'arraybuffer' : 'blob';

    ws.onopen = () => {
      console.log(`[TAG ${tag}] OPEN`, ws.readyState);
      wasOpenedRef.current = true;
      socketRef.current = ws;
      setProtocolState('open');
      emit('socket', 'open', { type: 'open' });
    };

    ws.onmessage = (e) => {
      const data = binary ? new Uint8Array(e.data) : e.data;
      let frame;
      console.log(`[TAG ${tag}] MESSAGE ${typeof data}`, data, binary);

      const type = data instanceof ArrayBuffer || data instanceof Uint8Array ? 'binary' : typeof data;

      switch (type) {
        case 'string':
          try {
            frame = JSON.parse(data);
          } catch (err) {
            console.warn('Failed to parse string message:', err);
            frame = null;
          }
          break;
        case 'binary':
          frame = decodeFrame(data);
          break;
        case 'object':
          frame = data;
          break;
        default:
          frame = null;
          console.warn('Unrecognized frame format');
          break;
      }

      if (frame) {
        // 🔹 Adapt new bridge format to old UI expectations
        emit('socket', 'message', frame);
        
        // 🔁 Lifecycle transitions (unchanged)
        if (frame.portNum === 63 && frame.payload?.ack) {
          resolveAck(frame.requestId);
          setProtocolState('waiting');
        }

        if (frame.portNum === 64 && frame.payload?.reply) {
          setProtocolState('open');
          handleReply(frame.payload.reply);
        }
      }
    };

    ws.onerror = (e) => {
      console.error(`[TAG ${tag}] ERROR`, e);
      setProtocolState('error');
      emit('socket', 'error', {
        type: e?.type || 'error',
        message: 'WebSocket error occurred',
        raw: e
      });
    };

    ws.onclose = (e) => {
      console.log(`[TAG ${tag}] CLOSE code=${e?.code} reason=${e?.reason} wasClean=${e?.wasClean}`);
      if (e.code === 1013) {
        setProtocolState('closing');
      } else {
        setProtocolState('closed');
      }
      emit('socket', 'close', {
        type: 'close',
        code: e?.code,
        reason: e?.reason
      });
    };
  };

  const send = (payload) => {
    const ws = socketRef.current;
    const ready = ws?.readyState;
    const tag = currentTagRef.current;

    console.log(`[TAG ${tag}] SEND ATTEMPT`, {
      ready,
      wasOpened: wasOpenedRef.current,
      protocolState
    });

    if (ready !== WebSocket.OPEN) {
      console.warn(`[TAG ${tag}] SEND failed, websocket ${wasOpenedRef.current ? 'was open earlier' : 'never opened'}`, {
        ready,
        wasOpened: wasOpenedRef.current,
        protocolState
      });
    } else {
      console.log(`[TAG ${tag}] SEND`, payload);
      // 🔹 Use guarded send
      sendToBridge(ws, payload);
    }
  };

  const close = () => {
    const tag = currentTagRef.current;
    if (socketRef.current) {
      console.log(`[TAG ${tag}] MANUAL CLOSE CALLED`);
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  return {
    connect,
    close,
    send,
    protocolState,
    setProtocolState
  };
}
