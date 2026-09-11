// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Structured Logging & Observability
// ============================================================

import pino from 'pino';
import { env } from './env.js';

const baseLogger = pino({
	level: env.LOG_LEVEL,
});

type LogContext = Record<string, unknown>;

export const logger = {
	info(message: string, context?: LogContext): void {
		context ? baseLogger.info(context, message) : baseLogger.info(message);
	},
	warn(message: string, context?: LogContext): void {
		context ? baseLogger.warn(context, message) : baseLogger.warn(message);
	},
	error(message: string, context?: LogContext): void {
		context ? baseLogger.error(context, message) : baseLogger.error(message);
	},
	debug(message: string, context?: LogContext): void {
		context ? baseLogger.debug(context, message) : baseLogger.debug(message);
	},
};
