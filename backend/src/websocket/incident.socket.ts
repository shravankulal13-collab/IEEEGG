// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Live Incident Queue WebSocket Handler
// ============================================================

import { Server, Socket } from 'socket.io';
import {
  INCIDENT_EVENTS,
  IncidentCreatedPayload,
  IncidentStatusChangedPayload,
  IncidentPriorityChangedPayload,
  IncidentVerifiedPayload,
  IncidentDispatchedPayload,
  IncidentEscalatedPayload,
  IncidentResolvedPayload,
  IncidentCancelledPayload,
} from '../modules/incidents/incident.events.js';

export function registerIncidentSocketHandlers(io: Server, socket: Socket): void {
  socket.on('join:incident', (incidentId: string) => {
    if (typeof incidentId === 'string' && incidentId.trim().length > 0) {
      socket.join(`incident:${incidentId}`);
    }
  });

  socket.on('leave:incident', (incidentId: string) => {
    if (typeof incidentId === 'string' && incidentId.trim().length > 0) {
      socket.leave(`incident:${incidentId}`);
    }
  });
}

export function broadcastIncidentCreated(io: Server, payload: IncidentCreatedPayload): void {
  io.to('command_center').emit(INCIDENT_EVENTS.CREATED, payload);
}

export function broadcastIncidentStatusChanged(
  io: Server,
  payload: IncidentStatusChangedPayload
): void {
  io.to('command_center').emit(INCIDENT_EVENTS.STATUS_CHANGED, payload);
  io.to(`incident:${payload.incident_id}`).emit(INCIDENT_EVENTS.STATUS_CHANGED, payload);
}

export function broadcastIncidentPriorityChanged(
  io: Server,
  payload: IncidentPriorityChangedPayload
): void {
  io.to('command_center').emit(INCIDENT_EVENTS.PRIORITY_CHANGED, payload);
  io.to(`incident:${payload.incident_id}`).emit(INCIDENT_EVENTS.PRIORITY_CHANGED, payload);
}

export function broadcastIncidentVerified(io: Server, payload: IncidentVerifiedPayload): void {
  io.to('command_center').emit(INCIDENT_EVENTS.VERIFIED, payload);
  io.to(`incident:${payload.incident_id}`).emit(INCIDENT_EVENTS.VERIFIED, payload);
}

export function broadcastIncidentDispatched(
  io: Server,
  payload: IncidentDispatchedPayload
): void {
  io.to('command_center').emit(INCIDENT_EVENTS.DISPATCHED, payload);
  io.to(`incident:${payload.incident_id}`).emit(INCIDENT_EVENTS.DISPATCHED, payload);
}

export function broadcastIncidentEscalated(
  io: Server,
  payload: IncidentEscalatedPayload
): void {
  io.to('command_center').emit(INCIDENT_EVENTS.ESCALATED, payload);
  io.to(`incident:${payload.incident_id}`).emit(INCIDENT_EVENTS.ESCALATED, payload);
}

export function broadcastIncidentResolved(io: Server, payload: IncidentResolvedPayload): void {
  io.to('command_center').emit(INCIDENT_EVENTS.RESOLVED, payload);
  io.to(`incident:${payload.incident_id}`).emit(INCIDENT_EVENTS.RESOLVED, payload);
}

export function broadcastIncidentCancelled(
  io: Server,
  payload: IncidentCancelledPayload
): void {
  io.to('command_center').emit(INCIDENT_EVENTS.CANCELLED, payload);
  io.to(`incident:${payload.incident_id}`).emit(INCIDENT_EVENTS.CANCELLED, payload);
}
