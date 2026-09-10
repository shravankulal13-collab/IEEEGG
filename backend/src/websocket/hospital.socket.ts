// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Resource Updates WebSocket Handler
// ============================================================

import { Server, Socket } from "socket.io";

export interface HospitalSocketPayload {
  hospitalId: string;
  hospitalName?: string;
  status?: string;

  availableBeds?: number;
  availableIcuBeds?: number;
  availableDoctors?: number;

  resourceType?: string;
  availableQuantity?: number;
  totalQuantity?: number;

  timestamp?: string;
}

export function registerHospitalSocket(
  io: Server,
  socket: Socket,
): void {
  // Subscribe to a specific hospital
  socket.on(
    "hospital:subscribe",
    (hospitalId: string) => {
      if (!hospitalId) return;

      socket.join(`hospital:${hospitalId}`);
    },
  );

  // Unsubscribe from a specific hospital
  socket.on(
    "hospital:unsubscribe",
    (hospitalId: string) => {
      if (!hospitalId) return;

      socket.leave(`hospital:${hospitalId}`);
    },
  );
}

export function emitHospitalCapacityUpdated(
  io: Server,
  payload: HospitalSocketPayload,
): void {
  io.to(`hospital:${payload.hospitalId}`).emit(
    "hospital:capacity_updated",
    {
      ...payload,
      timestamp:
        payload.timestamp ??
        new Date().toISOString(),
    },
  );
}

export function emitHospitalResourceUpdated(
  io: Server,
  payload: HospitalSocketPayload,
): void {
  io.to(`hospital:${payload.hospitalId}`).emit(
    "hospital:resource_updated",
    {
      ...payload,
      timestamp:
        payload.timestamp ??
        new Date().toISOString(),
    },
  );
}

export function emitHospitalStatusUpdated(
  io: Server,
  payload: HospitalSocketPayload,
): void {
  io.to(`hospital:${payload.hospitalId}`).emit(
    "hospital:status_updated",
    {
      ...payload,
      timestamp:
        payload.timestamp ??
        new Date().toISOString(),
    },
  );
}

export function emitHospitalDoctorAvailabilityUpdated(
  io: Server,
  payload: HospitalSocketPayload,
): void {
  io.to(`hospital:${payload.hospitalId}`).emit(
    "hospital:doctor_availability_updated",
    {
      ...payload,
      timestamp:
        payload.timestamp ??
        new Date().toISOString(),
    },
  );
}