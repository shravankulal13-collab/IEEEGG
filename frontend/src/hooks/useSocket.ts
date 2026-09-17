// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Realtime Socket Event Subscription Hook
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import { useEffect, useCallback, useState } from 'react';
import { socketService } from '../services/socket';

export function useSocket(event?: string, callback?: (data: any) => void) {
  const [isConnected, setIsConnected] = useState<boolean>(() => socketService.getStatus().connected);

  useEffect(() => {
    const unsubConnect = socketService.on('connected', () => {
      setIsConnected(true);
    });

    let unsubEvent: (() => void) | undefined;
    if (event && callback) {
      unsubEvent = socketService.on(event, callback);
    }

    return () => {
      unsubConnect();
      if (unsubEvent) {
        unsubEvent();
      }
    };
  }, [event, callback]);

  const emit = useCallback((eventName: string, data: any) => {
    socketService.emit(eventName, data);
  }, []);

  return {
    isConnected,
    emit,
  };
}
