// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Server Lifecycle & Bootstrap
// ============================================================

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { registerAmbulanceSocketHandlers } from './websocket/ambulance.socket';
import { staleGpsJob } from './jobs/staleGps.job';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  registerAmbulanceSocketHandlers(io, socket);
});

// Start background stale telemetry detection job
staleGpsJob.startPeriodicCheck(30000);

server.listen(PORT, () => {
  console.log(`[Backend] Server listening on port ${PORT}`);
});

export { server, io };
