// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Authentication & Session Verification Middleware
// ============================================================

import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export interface AuthUser {
  id: string;
  email: string;
  role: 'citizen' | 'dispatcher' | 'ambulance_driver' | 'hospital_admin' | 'hospital_staff' | 'system_admin';
  fullName?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      id?: string;
    }
  }
}

/**
 * Validates JWT access tokens from the Authorization header.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Authentication token is required to access this resource.',
      },
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      fullName: decoded.fullName,
    };
    next();
  } catch (err: any) {
    logger.warn('JWT verification failed', { err: err.message, ip: req.ip });
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Provided authentication token is invalid or has expired.',
      },
    });
  }
}

/**
 * Optional authentication that populates req.user if a valid token is present.
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        fullName: decoded.fullName,
      };
    } catch {
      // Ignored for optional authentication
    }
  }

  next();
}
