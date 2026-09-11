// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Environment Variable Schema & Validation
// ============================================================

import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	PORT: z.coerce.number().int().positive().default(5000),
	DATABASE_URL: z.string().min(1).default('postgresql://localhost:5432/emergency_response'),
	REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
	JWT_SECRET: z.string().min(1).default('replace_with_secure_secret'),
	FRONTEND_URL: z.string().url().default('http://localhost:5173'),
	MAPPLS_CLIENT_ID: z.string().optional(),
	MAPPLS_API_KEY: z.string().optional(),
	MAPMYINDIA_CLIENT_ID: z.string().optional(),
	MAPMYINDIA_CLIENT_SECRET: z.string().optional(),
	MAPMYINDIA_ACCESS_TOKEN: z.string().optional(),
	WAZE_API_KEY: z.string().optional(),
	WAZE_FEED_URL: z.string().url().optional(),
	OSRM_BASE_URL: z.string().url().optional(),
	LOG_LEVEL: z.string().default('info'),
});

const parsed = envSchema.parse(process.env);

export const env = {
	...parsed,
	MAPPLS_CLIENT_ID: parsed.MAPPLS_CLIENT_ID ?? parsed.MAPMYINDIA_CLIENT_ID ?? '',
	MAPPLS_API_KEY: parsed.MAPPLS_API_KEY ?? parsed.MAPMYINDIA_CLIENT_SECRET ?? parsed.MAPMYINDIA_ACCESS_TOKEN ?? '',
};
