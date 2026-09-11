// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Central Socket.IO Gateway & Room Manager
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import { Server } from 'socket.io';
import { registerAmbulanceSocketHandlers } from './ambulance.socket';
import { registerIncidentSocketHandlers } from './incident.socket';
import { registerNotificationSocketHandlers } from './notification.socket';
import { notificationService } from '../modules/notifications/notification.service';

// ============================================================
// Room name constants
// Centralised here so all modules use the same room naming scheme.
// ============================================================

export const SOCKET_ROOMS = {
  /** All dispatchers and command-center operators join this room. */
  COMMAND_CENTER: 'command_center',

  /** Per-user notification channel: `user:{userId}` */
  user: (userId: string) => `user:${userId}`,

  /** Per-ambulance live telemetry channel: `ambulance:{id}` */
  ambulance: (ambulanceId: string) => `ambulance:${ambulanceId}`,

  /** Per-incident tracking channel: `incident:{id}` */
  incident: (incidentId: string) => `incident:${incidentId}`,
} as const;

// ============================================================
// Central gateway setup
// Called once from server.ts after the SocketIOServer is created.
// ============================================================

/**
 * Wire all Socket.IO handlers to the given server instance.
 *
 * This is the ONLY place that calls io.on('connection').
 * All other socket modules register their handlers here via delegation.
 *
 * It also injects the `io` reference into services that need to push
 * realtime events (e.g. notificationService).
 */
export function setupSocketServer(io: Server): void {
  // Give the notification service a reference to `io` so it can push
  // realtime notification:new events when notifications are created.
  notificationService.setSocketServer(io);

  io.on('connection', (socket) => {
    // ----------------------------------------------------------
    // Room: command_center
    // Dispatchers and operators subscribe here to receive ALL
    // operational updates (incidents, notifications, escalations).
    // ----------------------------------------------------------
    socket.on('join:command_center', () => {
      socket.join(SOCKET_ROOMS.COMMAND_CENTER);
    });

    socket.on('leave:command_center', () => {
      socket.leave(SOCKET_ROOMS.COMMAND_CENTER);
    });

    // ----------------------------------------------------------
    // Room: user:{userId}
    // Each authenticated user joins their personal notification room.
    // ----------------------------------------------------------
    socket.on('join:user', (userId: string) => {
      if (typeof userId === 'string' && userId.trim().length > 0) {
        socket.join(SOCKET_ROOMS.user(userId));
      }
    });

    socket.on('leave:user', (userId: string) => {
      if (typeof userId === 'string' && userId.trim().length > 0) {
        socket.leave(SOCKET_ROOMS.user(userId));
      }
    });

    // ----------------------------------------------------------
    // Domain-specific handlers
    // ----------------------------------------------------------

    // Ambulance GPS telemetry (Saishree's handler — preserved as-is)
    registerAmbulanceSocketHandlers(io, socket);

    // Incident lifecycle subscriptions
    registerIncidentSocketHandlers(io, socket);

    // Notification read/ack actions
    registerNotificationSocketHandlers(io, socket);

    // ----------------------------------------------------------
    // Disconnect
    // Socket.IO automatically removes the socket from all rooms
    // on disconnect — no manual cleanup is required.
    // ----------------------------------------------------------
    socket.on('disconnect', (_reason: string) => {
      // Future: track active dispatcher sessions for analytics
    });
  });
}
