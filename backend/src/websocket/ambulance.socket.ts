// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Live Telemetry WebSocket Handler
// ============================================================

import { Server, Socket } from 'socket.io';
import { trackingService } from '../modules/tracking/tracking.service';
import { ambulanceService } from '../modules/ambulances/ambulance.service';

export function registerAmbulanceSocketHandlers(io: Server, socket: Socket): void {
  socket.on('join:ambulance', (ambulanceId: string) => {
    socket.join(`ambulance:${ambulanceId}`);
  });

  socket.on('join:incident_tracking', (incidentId: string) => {
    socket.join(`incident:${incidentId}`);
  });

  socket.on(
    'telemetry:location_update',
    async (payload: {
      ambulance_id: string;
      latitude: number;
      longitude: number;
      speed_kmh?: number;
      heading?: number;
      accuracy_meters?: number;
      incident_latitude?: number;
      incident_longitude?: number;
      incident_id?: string;
    }) => {
      try {
        const processed = await trackingService.processTelemetry(payload);

        // Broadcast to specific ambulance subscribers
        io.to(`ambulance:${payload.ambulance_id}`).emit('telemetry:broadcast', processed);

        // Broadcast to citizen incident subscribers if incident_id provided
        if (payload.incident_id) {
          io.to(`incident:${payload.incident_id}`).emit('telemetry:broadcast', processed);
        }
      } catch (error: any) {
        socket.emit('telemetry:error', { message: error.message });
      }
    }
  );

  socket.on(
    'ambulance:status_update',
    async (payload: {
      ambulance_id: string;
      status: any;
      incident_id?: string;
      hospital_id?: string;
    }) => {
      try {
        const updated = await ambulanceService.updateAmbulanceStatus(
          payload.ambulance_id,
          payload.status,
          payload.incident_id,
          payload.hospital_id
        );

        io.to(`ambulance:${payload.ambulance_id}`).emit('status:broadcast', updated);
        if (payload.incident_id) {
          io.to(`incident:${payload.incident_id}`).emit('status:broadcast', updated);
        }
      } catch (error: any) {
        socket.emit('status:error', { message: error.message });
      }
    }
  );
}
