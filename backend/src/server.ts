// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Server Lifecycle & Bootstrap
// ============================================================

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { setupSocketServer } from './websocket/socket.server.js';
import { staleGpsJob } from './jobs/staleGps.job.js';
import { incidentEscalationJob } from './jobs/incidentEscalation.job.js';
import { startProviderHealthJob, stopProviderHealthJob } from './jobs/providerHealth.job.js';
import { startRouteMonitoringJob, stopRouteMonitoringJob } from './jobs/routeMonitoring.job.js';
import { dispatchTimeoutJob } from './jobs/dispatchTimeout.job.js';
import { hospitalResourceExpiryJob } from './jobs/hospitalResourceExpiry.job.js';

const PORT = env.PORT || 5000;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: env.FRONTEND_URL === '*' ? '*' : [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
});

// Setup central websocket server and namespace/room delegation
setupSocketServer(io);

// Start background asynchronous jobs
const staleGpsTimer = staleGpsJob.startPeriodicCheck(30000);
const incidentEscalationTimer = incidentEscalationJob.startPeriodicCheck(60000);
const dispatchTimeoutTimer = dispatchTimeoutJob.startPeriodicCheck(60000);
const hospitalExpiryTimer = hospitalResourceExpiryJob.startPeriodicCheck(900000);
startProviderHealthJob();
startRouteMonitoringJob(io);

server.listen(PORT, () => {
  logger.info(`[Backend] Emergency Response Platform server listening on port ${PORT} in ${env.NODE_ENV} mode`);
});

// Graceful shutdown handling
function gracefulShutdown(signal: string): void {
  logger.info(`Received ${signal}. Gracefully shutting down...`);
  clearInterval(staleGpsTimer);
  clearInterval(incidentEscalationTimer);
  clearInterval(dispatchTimeoutTimer);
  clearInterval(hospitalExpiryTimer);
  stopProviderHealthJob();
  stopRouteMonitoringJob();

  io.close(() => {
    logger.info('Socket.IO connections closed.');
  });

  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { server, io };
