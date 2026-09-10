// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch Event WebSocket Handler
// ============================================================

import { Server, Socket } from "socket.io";

export interface DispatchSocketPayload {
  dispatchId: string;
  incidentId?: string;
  ambulanceId?: string;
  hospitalId?: string;
  status?: string;
  score?: number;
  reason?: string;
  timestamp?: string;
}

export function registerDispatchSocket(
  io: Server,
  socket: Socket,
): void {
  // Subscribe to a specific dispatch
  socket.on(
    "dispatch:subscribe",
    (dispatchId: string) => {
      if (!dispatchId) return;

      socket.join(`dispatch:${dispatchId}`);
    },
  );

  // Unsubscribe from a specific dispatch
  socket.on(
    "dispatch:unsubscribe",
    (dispatchId: string) => {
      if (!dispatchId) return;

      socket.leave(`dispatch:${dispatchId}`);
    },
  );
}

export function emitDispatchCreated(
  io: Server,
  payload: DispatchSocketPayload,
): void {
  io.to(`dispatch:${payload.dispatchId}`).emit(
    "dispatch:created",
    {
      ...payload,
      timestamp:
        payload.timestamp ??
        new Date().toISOString(),
    },
  );
}

export function emitDispatchRecommendation(
  io: Server,
  payload: DispatchSocketPayload,
): void {
  io.to(`dispatch:${payload.dispatchId}`).emit(
    "dispatch:recommendation",
    {
      ...payload,
      timestamp:
        payload.timestamp ??
        new Date().toISOString(),
    },
  );
}

export function emitDispatchStatusUpdated(
  io: Server,
  payload: DispatchSocketPayload,
): void {
  io.to(`dispatch:${payload.dispatchId}`).emit(
    "dispatch:status_updated",
    {
      ...payload,
      timestamp:
        payload.timestamp ??
        new Date().toISOString(),
    },
  );
}

export function emitAmbulanceAssigned(
  io: Server,
  payload: DispatchSocketPayload,
): void {
  io.to(`dispatch:${payload.dispatchId}`).emit(
    "dispatch:ambulance_assigned",
    {
      ...payload,
      timestamp:
        payload.timestamp ??
        new Date().toISOString(),
    },
  );
}

export function emitDispatchCompleted(
  io: Server,
  payload: DispatchSocketPayload,
): void {
  io.to(`dispatch:${payload.dispatchId}`).emit(
    "dispatch:completed",
    {
      ...payload,
      timestamp:
        payload.timestamp ??
        new Date().toISOString(),
    },
  );
}