// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch Event WebSocket Handler
// ============================================================

import { Server, Socket } from 'socket.io';

export const setupDispatchSockets = (io: Server) => {
  const dispatchNamespace = io.of('/dispatch');

  dispatchNamespace.on('connection', (socket: Socket) => {
    console.log(`Dispatcher connected: ${socket.id}`);

    socket.on('join-ambulance-room', (ambulanceId) => {
      socket.join(`ambulance_${ambulanceId}`);
    });

    socket.on('accept-dispatch', (data) => {
      // Logic to confirm dispatch acceptance and notify engine
      dispatchNamespace.emit('dispatch-status-updated', { dispatchId: data.dispatchId, status: 'ACCEPTED' });
    });
  });
};