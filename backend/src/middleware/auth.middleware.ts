// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Authentication Middleware
// ============================================================

import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
	const authorization = req.header('authorization');
	const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;

	if (!token) {
		res.status(401).json({ error: 'authentication required' });
		return;
	}

	try {
		jwt.verify(token, env.JWT_SECRET);
		next();
	} catch {
		res.status(401).json({ error: 'invalid or expired token' });
	}
}
