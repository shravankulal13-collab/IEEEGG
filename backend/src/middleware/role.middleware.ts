// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Role-Based Authorization & Access Control Middleware
// ============================================================

import type { NextFunction, Request, Response } from 'express';

export type UserRole =
  | 'citizen'
  | 'dispatcher'
  | 'ambulance_driver'
  | 'hospital_admin'
  | 'hospital_staff'
  | 'system_admin';

/**
 * Ensures the authenticated user possesses one of the allowed roles.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'User authentication required prior to role authorization.',
        },
      });
      return;
    }

    // System admin has universal administrative access
    if (req.user.role === 'system_admin' || allowedRoles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: `Forbidden: Role '${req.user.role}' is not authorized to perform this operation. Allowed: [${allowedRoles.join(', ')}]`,
      },
    });
  };
}

/**
 * Checks if user is authenticated with any valid system role.
 */
export function requireAnyRole(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Valid session required.',
      },
    });
    return;
  }
  next();
}
