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
} from '../modules/incidents/incident.events';

// ============================================================
// Connection-level event handlers
// Called once per connected socket from setupSocketServer.
// ============================================================

/**
 * Register incident-domain socket event listeners for a single
 * connected client.
 *
 * Most incident lifecycle updates originate from backend services
 * and are pushed via the broadcaster functions below.
 * This handler manages only client-side room subscriptions so
 * clients can opt in to a specific incident's live stream.
 */
export function registerIncidentSocketHandlers(io: Server, socket: Socket): void {
  /**
   * Join an incident-specific room.
   * Used by: citizen tracking view, command center incident detail panel.
   */
  socket.on('join:incident', (incidentId: string) => {
    if (typeof incidentId === 'string' && incidentId.trim().length > 0) {
      socket.join(`incident:${incidentId}`);
    }
  });

  /**
   * Leave an incident room when the user navigates away.
   */
  socket.on('leave:incident', (incidentId: string) => {
    if (typeof incidentId === 'string' && incidentId.trim().length > 0) {
      socket.leave(`incident:${incidentId}`);
    }
  });
}

// ============================================================
// Broadcaster functions
//
// Called by backend services (incident service, dispatch service,
// escalation job, etc.) to push incident lifecycle events to
// connected clients. Each broadcaster requires the `io` instance,
// which is available after setupSocketServer wires it up.
//
// Room targeting:
//   command_center         — all dispatchers / operators
//   incident:{incidentId}  — clients subscribed to one incident
// ============================================================

/** Broadcast to command center when a new incident is created. */
export function broadcastIncidentCreated(io: Server, payload: IncidentCreatedPayload): void {
  io.to('command_center').emit(INCIDENT_EVENTS.CREATED, payload);
}

/**
 * Broadcast an incident status change to the command center and to
 * any clients subscribed to that specific incident's room.
 */
export function broadcastIncidentStatusChanged(
  io: Server,
  payload: IncidentStatusChangedPayload
): void {
  io.to('command_center').emit(INCIDENT_EVENTS.STATUS_CHANGED, payload);
  io.to(`incident:${payload.incident_id}`).emit(INCIDENT_EVENTS.STATUS_CHANGED, payload);
}

/** Broadcast a priority/severity change. */
export function broadcastIncidentPriorityChanged(
  io: Server,
  payload: IncidentPriorityChangedPayload
): void {
  io.to('command_center').emit(INCIDENT_EVENTS.PRIORITY_CHANGED, payload);
  io.to(`incident:${payload.incident_id}`).emit(INCIDENT_EVENTS.PRIORITY_CHANGED, payload);
}

/** Broadcast when an incident completes the verification step. */
export function broadcastIncidentVerified(io: Server, payload: IncidentVerifiedPayload): void {
  io.to('command_center').emit(INCIDENT_EVENTS.VERIFIED, payload);
  io.to(`incident:${payload.incident_id}`).emit(INCIDENT_EVENTS.VERIFIED, payload);
}

/** Broadcast when an ambulance is dispatched to an incident. */
export function broadcastIncidentDispatched(
  io: Server,
  payload: IncidentDispatchedPayload
): void {
  io.to('command_center').emit(INCIDENT_EVENTS.DISPATCHED, payload);
  io.to(`incident:${payload.incident_id}`).emit(INCIDENT_EVENTS.DISPATCHED, payload);
}

/**
 * Broadcast when the escalation job detects an SLA breach.
 * Targets both the command center and the incident-specific room.
 */
export function broadcastIncidentEscalated(
  io: Server,
  payload: IncidentEscalatedPayload
): void {
  io.to('command_center').emit(INCIDENT_EVENTS.ESCALATED, payload);
  io.to(`incident:${payload.incident_id}`).emit(INCIDENT_EVENTS.ESCALATED, payload);
}

/** Broadcast when an incident is marked resolved. */
export function broadcastIncidentResolved(io: Server, payload: IncidentResolvedPayload): void {
  io.to('command_center').emit(INCIDENT_EVENTS.RESOLVED, payload);
  io.to(`incident:${payload.incident_id}`).emit(INCIDENT_EVENTS.RESOLVED, payload);
}

/** Broadcast when an incident is cancelled or marked as a false report. */
export function broadcastIncidentCancelled(
  io: Server,
  payload: IncidentCancelledPayload
): void {
  io.to('command_center').emit(INCIDENT_EVENTS.CANCELLED, payload);
  io.to(`incident:${payload.incident_id}`).emit(INCIDENT_EVENTS.CANCELLED, payload);
}
