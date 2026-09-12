// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Structured Logger Configuration
// ============================================================

import pino from 'pino';
import { env } from './env.js';

const sensitiveKeys = ['password', 'password_hash', 'secret', 'token', 'authorization', 'apiKey', 'cookie'];

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: sensitiveKeys.flatMap((key) => [
      key,
      `*.${key}`,
      `*.*.${key}`,
      `req.headers.${key}`,
      `body.${key}`,
    ]),
    censor: '[REDACTED]',
  },
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino/file',
        }
      : undefined,
  base: {
    service: 'emergency-response-platform',
    env: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
