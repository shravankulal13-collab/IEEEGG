// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Server Lifecycle & Bootstrap
// ============================================================

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { setupSocketServer } from './websocket/socket.server';
import { staleGpsJob } from './jobs/staleGps.job';
import { incidentEscalationJob } from './jobs/incidentEscalation.job';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: '*' },
});

// Register all Socket.IO handlers (ambulance telemetry, incident events,
// notification delivery) through the central gateway.
setupSocketServer(io);

// Start background stale telemetry detection job
staleGpsJob.startPeriodicCheck(30000);

// Start incident SLA escalation job (runs every 60 seconds)
incidentEscalationJob.startPeriodicCheck(60000);

server.listen(PORT, () => {
  console.log(`[Backend] Server listening on port ${PORT}`);
});

export { server, io };
