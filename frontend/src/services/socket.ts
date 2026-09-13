// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Realtime Socket Client Service
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export type ConnectionState = 'LIVE' | 'RECONNECTING' | 'OFFLINE';

export const INCIDENT_SOCKET_EVENTS = {
  CREATED: 'incident:created',
  STATUS_CHANGED: 'incident:status_changed',
  PRIORITY_CHANGED: 'incident:priority_changed',
  VERIFIED: 'incident:verified',
  DISPATCHED: 'incident:dispatched',
  ESCALATED: 'incident:escalated',
  RESOLVED: 'incident:resolved',
  CANCELLED: 'incident:cancelled',
} as const;

export const NOTIFICATION_SOCKET_EVENTS = {
  NEW: 'notification:new',
  SYSTEM_ALERT: 'notification:system_alert',
  MARKED_READ: 'notification:marked_read',
  ALL_MARKED_READ: 'notification:all_marked_read',
  ERROR: 'notification:error',
  MARK_READ: 'notification:mark_read',
  MARK_ALL_READ: 'notification:mark_all_read',
} as const;

export const AMBULANCE_SOCKET_EVENTS = {
  TELEMETRY: 'telemetry:broadcast',
  STATUS: 'status:broadcast',
} as const;

type StateListener = (state: ConnectionState) => void;

class SocketClient {
  private socket: Socket | null = null;
  private state: ConnectionState = 'OFFLINE';
  private stateListeners = new Set<StateListener>();
  private joinedCommandCenter = false;

  getConnectionState(): ConnectionState {
    return this.state;
  }

  hasJoinedCommandCenter(): boolean {
    return this.joinedCommandCenter;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  subscribe(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  connect(): Socket {
    if (this.socket) return this.socket;

    this.setState('RECONNECTING');
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 8000,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.setState('LIVE');
      this.joinCommandCenter();
    });

    this.socket.on('disconnect', () => {
      this.joinedCommandCenter = false;
      this.setState('OFFLINE');
    });

    this.socket.io.on('reconnect_attempt', () => {
      this.setState('RECONNECTING');
    });

    this.socket.io.on('reconnect', () => {
      this.setState('LIVE');
      this.joinCommandCenter();
    });

    this.socket.on('connect_error', () => {
      this.setState(this.socket?.connected ? 'LIVE' : 'RECONNECTING');
    });

    return this.socket;
  }

  joinCommandCenter(): void {
    if (!this.socket) return;
    this.socket.emit('join:command_center');
    this.joinedCommandCenter = true;
  }

  joinIncident(incidentId: string): void {
    this.socket?.emit('join:incident', incidentId);
  }

  leaveIncident(incidentId: string): void {
    this.socket?.emit('leave:incident', incidentId);
  }

  joinAmbulance(ambulanceId: string): void {
    this.socket?.emit('join:ambulance', ambulanceId);
  }

  markNotificationRead(notificationId: string, userId: string): void {
    this.socket?.emit(NOTIFICATION_SOCKET_EVENTS.MARK_READ, {
      notification_id: notificationId,
      user_id: userId,
    });
  }

  markAllNotificationsRead(userId: string): void {
    this.socket?.emit(NOTIFICATION_SOCKET_EVENTS.MARK_ALL_READ, { user_id: userId });
  }

  private setState(next: ConnectionState): void {
    this.state = next;
    this.stateListeners.forEach((listener) => listener(next));
  }
}

export const socketClient = new SocketClient();
