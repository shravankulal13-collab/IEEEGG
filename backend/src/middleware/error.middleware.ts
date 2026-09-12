// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Centralized Error Handling & Exception Middleware
// ============================================================

import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown> | Array<unknown>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_SERVER_ERROR',
    details?: Record<string, unknown> | Array<unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Requested resource was not found', details?: Record<string, unknown>) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed for request parameters', details?: Record<string, unknown> | Array<unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication credentials are required or invalid') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access to this resource is forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict occurred', details?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT', details);
  }
}

/**
 * Express error handling middleware converting all errors to a standardized JSON response.
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.id || req.headers['x-request-id'] || 'unknown';

  // 1. Handle custom AppError
  if (err instanceof AppError) {
    logger.warn(`Operational error: ${err.message}`, {
      requestId,
      code: err.code,
      statusCode: err.statusCode,
      message: err.message,
      path: req.originalUrl,
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // 2. Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    logger.warn('Request schema validation failed', { requestId, errors: formattedErrors, path: req.originalUrl });

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload or query parameters.',
        details: formattedErrors,
      },
    });
    return;
  }

  // 3. Handle PostgreSQL Unique Constraint Violation
  if ((err as any).code === '23505') {
    logger.warn('PostgreSQL unique constraint violation', { requestId, detail: (err as any).detail });
    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'A record with this unique identifier already exists.',
      },
    });
    return;
  }

  // 4. Fallback for unhandled unexpected server errors
  logger.error('Unhandled server error occurred', {
    requestId,
    err: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        env.NODE_ENV === 'production'
          ? 'An internal server error occurred. Please contact system support.'
          : err.message,
      ...(env.NODE_ENV === 'development' && { details: { stack: err.stack } }),
    },
  });
}
