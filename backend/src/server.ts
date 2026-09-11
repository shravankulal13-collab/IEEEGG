// ============================================================
// PRIMARY OWNER: SK / khushi.shettyyy
// ROLE: Core Platform + Realtime Socket Server Gateway
// MODULE: Server Lifecycle & Bootstrap
// ============================================================

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from './app.js';
import { checkDatabaseHealth } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { incidentEscalationJob } from './jobs/incidentEscalation.job.js';
import { staleGpsJob } from './jobs/staleGps.job.js';
import { setupSocketServer } from './websocket/socket.server.js';

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: [
      env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      '*',
    ],
    credentials: true,
  },
});

// Register all Socket.IO handlers (ambulance telemetry, incident events, notifications)
setupSocketServer(io);

// Background scheduled monitoring jobs
let staleGpsInterval: NodeJS.Timeout | null = null;
let incidentEscalationInterval: NodeJS.Timeout | null = null;

async function startServer(): Promise<void> {
  try {
    const dbStatus = await checkDatabaseHealth();
    logger.info(
      { provider: dbStatus.provider, connected: dbStatus.connected },
      'Database connection verified'
    );

    // Start background jobs
    staleGpsInterval = staleGpsJob.startPeriodicCheck(30000);
    incidentEscalationInterval = incidentEscalationJob.startPeriodicCheck(60000);

    server.listen(env.PORT, env.HOST, () => {
      logger.info(
        { port: env.PORT, host: env.HOST, env: env.NODE_ENV },
        `🚀 Emergency Response Intelligence Backend running at http://${env.HOST}:${env.PORT}`
      );
      logger.info(`📋 Health check available at http://localhost:${env.PORT}/api/health`);
    });
  } catch (err: any) {
    logger.fatal({ err: err.message }, 'Fatal error during server startup');
    process.exit(1);
  }
}

// Graceful shutdown
function gracefulShutdown(signal: string) {
  logger.info({ signal }, 'Received shutdown signal. Closing HTTP and Socket servers...');

  if (staleGpsInterval) clearInterval(staleGpsInterval);
  if (incidentEscalationInterval) clearInterval(incidentEscalationInterval);

  io.close(() => {
    logger.info('Socket.IO gateway closed.');
  });

  server.close(() => {
    logger.info('HTTP server closed successfully. Terminating process.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced termination: shutdown timeout exceeded');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Promise Rejection detected');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err: err.message, stack: err.stack }, 'Uncaught Exception detected');
  process.exit(1);
});

startServer();

export { server, io };
