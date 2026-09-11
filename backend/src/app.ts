// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Express Application Setup & Middleware Pipeline
// ============================================================

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, NotFoundError } from './middleware/error.middleware.js';
import { standardRateLimiter } from './middleware/rateLimit.middleware.js';
import { requestIdMiddleware } from './middleware/requestId.middleware.js';
import routes from './routes/index.js';

export function createApp(): Application {
  const app = express();

  // 1. Security Headers
  app.use(helmet());

  // 2. CORS Setup
  app.use(
    cors({
      origin: [
        env.FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id'],
    })
  );

  // 3. Request Tracing & Correlation ID
  app.use(requestIdMiddleware);

  // 4. Rate Limiting
  app.use(standardRateLimiter);

  // 5. Body & Cookie Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // 6. Mount Central API
  app.use('/api', routes);

  // 7. Root ping
  app.get('/', (_req, res) => {
    res.json({
      name: 'Emergency Response Intelligence & Coordination API',
      version: '1.0.0',
      status: 'active',
      documentation: '/api/health',
    });
  });

  // 8. 404 Not Found Handler for unmatched routes
  app.use((req, _res, next) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
  });

  // 9. Centralized Error Handling Pipeline
  app.use(errorHandler);

  return app;
}

export const app = createApp();
