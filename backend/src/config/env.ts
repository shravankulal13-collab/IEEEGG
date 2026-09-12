// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Environment Variable Schema & Validation
// ============================================================

import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file from backend root or current directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().default('postgresql://localhost:5432/emergency_response'),
  SUPABASE_URL: z.string().url().optional().or(z.literal('')),
  SUPABASE_SECRET_KEY: z.string().optional().or(z.literal('')),
  JWT_SECRET: z.string().min(8).default('emergency_response_jwt_secret_dev_key_2026!'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  MAPPLS_CLIENT_ID: z.string().optional(),
  MAPPLS_API_KEY: z.string().optional(),
  MAPMYINDIA_CLIENT_ID: z.string().optional(),
  MAPMYINDIA_CLIENT_SECRET: z.string().optional(),
  MAPMYINDIA_ACCESS_TOKEN: z.string().optional(),
  WAZE_API_KEY: z.string().optional(),
  WAZE_FEED_URL: z.string().url().optional(),
  OSRM_BASE_URL: z.string().url().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(300),
});

const parsed = envSchema.safeParse(process.env);

const rawEnv = parsed.success
  ? parsed.data
  : {
      NODE_ENV: 'development' as const,
      PORT: Number(process.env.PORT) || 5000,
      HOST: '0.0.0.0',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/emergency_response',
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
      JWT_SECRET: process.env.JWT_SECRET || 'emergency_response_jwt_secret_dev_key_2026!',
      JWT_EXPIRES_IN: '7d',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
      REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
      LOG_LEVEL: 'info' as const,
      MAPPLS_CLIENT_ID: process.env.MAPPLS_CLIENT_ID,
      MAPPLS_API_KEY: process.env.MAPPLS_API_KEY,
      MAPMYINDIA_CLIENT_ID: process.env.MAPMYINDIA_CLIENT_ID,
      MAPMYINDIA_CLIENT_SECRET: process.env.MAPMYINDIA_CLIENT_SECRET,
      MAPMYINDIA_ACCESS_TOKEN: process.env.MAPMYINDIA_ACCESS_TOKEN,
      WAZE_API_KEY: process.env.WAZE_API_KEY,
      WAZE_FEED_URL: process.env.WAZE_FEED_URL,
      OSRM_BASE_URL: process.env.OSRM_BASE_URL,
      RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
      RATE_LIMIT_MAX_REQUESTS: 300,
    };

export const env = {
  ...rawEnv,
  MAPPLS_CLIENT_ID: rawEnv.MAPPLS_CLIENT_ID ?? rawEnv.MAPMYINDIA_CLIENT_ID ?? '',
  MAPPLS_API_KEY:
    rawEnv.MAPPLS_API_KEY ??
    rawEnv.MAPMYINDIA_CLIENT_SECRET ??
    rawEnv.MAPMYINDIA_ACCESS_TOKEN ??
    '',
};
