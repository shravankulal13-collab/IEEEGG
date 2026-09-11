// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Server Lifecycle & Bootstrap
// ============================================================

import http from 'http';
import { app } from './app.js';
import { checkDatabaseHealth } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const server = http.createServer(app);

async function startServer(): Promise<void> {
  try {
    const dbStatus = await checkDatabaseHealth();
    logger.info(
      { provider: dbStatus.provider, connected: dbStatus.connected },
      'Database connection verified'
    );

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
  logger.info({ signal }, 'Received shutdown signal. Closing HTTP server...');
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

export { server };
