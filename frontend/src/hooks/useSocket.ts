// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Realtime Socket Event Subscription Hook
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import { useEffect, useState, useRef } from 'react';
import { socketClient, type ConnectionState } from '../services/socket';

/**
 * Hook to monitor Socket.IO connection status and ensure command_center room is joined.
 */
export function useSocket() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    socketClient.getConnectionState()
  );

  useEffect(() => {
    // Ensure socket is connected and room joined
    socketClient.connect();

    const unsubscribe = socketClient.subscribe((state) => {
      setConnectionState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    connectionState,
    isLive: connectionState === 'LIVE',
    isReconnecting: connectionState === 'RECONNECTING',
    isOffline: connectionState === 'OFFLINE',
    socket: socketClient.getSocket(),
  };
}

/**
 * Hook to subscribe to a specific Socket.IO event with automatic cleanup.
 */
export function useSocketEvent<T = any>(
  event: string,
  handler: (data: T) => void
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = socketClient.connect();

    const eventListener = (data: T) => {
      if (handlerRef.current) {
        handlerRef.current(data);
      }
    };

    socket.on(event, eventListener);

    return () => {
      socket.off(event, eventListener);
    };
  }, [event]);
}
