// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Central Socket.IO Gateway & Room Manager
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import { Server } from 'socket.io';
import { registerAmbulanceSocketHandlers } from './ambulance.socket.js';
import { registerIncidentSocketHandlers } from './incident.socket.js';
import { registerNotificationSocketHandlers } from './notification.socket.js';
import { setupDispatchSockets } from './dispatch.socket.js';
import { setupHospitalSockets } from './hospital.socket.js';
import { notificationService } from '../modules/notifications/notification.service.js';

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

export function setupSocketServer(io: Server): void {
  notificationService.setSocketServer(io);

  io.on('connection', (socket) => {
    socket.on('join:command_center', () => {
      socket.join(SOCKET_ROOMS.COMMAND_CENTER);
    });

    socket.on('leave:command_center', () => {
      socket.leave(SOCKET_ROOMS.COMMAND_CENTER);
    });

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

    // Ambulance GPS telemetry
    registerAmbulanceSocketHandlers(io, socket);

    // Incident lifecycle subscriptions
    registerIncidentSocketHandlers(io, socket);

    // Notification read/ack actions
    registerNotificationSocketHandlers(io, socket);

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  // Setup Dispatch & Hospital namespaces
  setupDispatchSockets(io);
  setupHospitalSockets(io);
}
