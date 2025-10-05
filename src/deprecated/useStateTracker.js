import { useState, useRef, useCallback } from 'react';

const SOCKET_STATES = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  OPEN: 'open',
  READY: 'ready',
  REQUESTING: 'requesting',
  AWAITING_ACK: 'awaiting_ack',
  WAITING: 'waiting',
  CLOSING: 'closing',
  CLOSED: 'closed',
  ERROR: 'error',
  RETRY_WAIT: 'retry_wait'
};

export function useStateTracker({ ackTimeoutMs = 5000, onAckTimeout }) {
    const [protocolState, setProtocolState] = useState('idle'); // init → ready
    const pendingAcks = useRef(new Map());

    const startAckWait = useCallback((requestId) => {
    setProtocolState(SOCKET_STATES.AWAITING_ACK);

    const startTime = Date.now();
    const timeoutId = setTimeout(() => {
        pendingAcks.current.delete(requestId);
        setProtocolState(SOCKET_STATES.RETRY_WAIT);
        onAckTimeout?.(requestId);
    }, ackTimeoutMs);

    pendingAcks.current.set(requestId, { startTime, timeoutId });
    }, [ackTimeoutMs, onAckTimeout]);

    const resolveAck = useCallback((requestId, proceedToWaiting = true) => {
    const ack = pendingAcks.current.get(requestId);
    if (!ack) return;

    clearTimeout(ack.timeoutId);
    const latency = Date.now() - ack.startTime;
    console.log(`ACK received for ${requestId} in ${latency}ms`);
    pendingAcks.current.delete(requestId);

    setProtocolState(proceedToWaiting ? SOCKET_STATES.WAITING : SOCKET_STATES.OPEN);
    }, []);

    const cancelAllAcks = useCallback(() => {
    for (const { timeoutId } of pendingAcks.current.values()) {
        clearTimeout(timeoutId);
    }
    pendingAcks.current.clear();
    setProtocolState(SOCKET_STATES.CLOSED);
    }, []);

    const transitionTo = useCallback((nextState) => {
    console.log(`Socket state: ${protocolState} → ${nextState}`);
    setProtocolState(nextState);
    }, [protocolState]);

    function transitionToState(stateKey) {
        const nextState = SOCKET_STATES[stateKey];
        if (!nextState) {
            console.warn(`Invalid socket state: ${stateKey}`);
            return;
        }

        console.log(`Socket state → ${nextState}`);
        setProtocolState(nextState);
    }



  return {
    protocolState,
    setProtocolState,
    startAckWait,
    resolveAck,
    cancelAllAcks
  };
}
