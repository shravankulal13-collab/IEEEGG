// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Resource Updates WebSocket Handler
// ============================================================

import { Server, Socket } from 'socket.io';

export const setupHospitalSockets = (io: Server) => {
  const hospitalNamespace = io.of('/hospital');

  hospitalNamespace.on('connection', (socket: Socket) => {
    socket.on('join-hospital-room', (hospitalId) => {
      socket.join(`hospital_${hospitalId}`);
    });

    socket.on('capacity-modifier', (data) => {
      // Real-time bed counter updates broadcast to dispatchers
      hospitalNamespace.emit('live-capacity-update', data);
    });
  });
};