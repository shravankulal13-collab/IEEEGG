// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Environment Configuration & Validation
// ============================================================

import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file from backend root or current directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().optional(),
  SUPABASE_URL: z.string().url().optional().or(z.literal('')),
  SUPABASE_SECRET_KEY: z.string().optional().or(z.literal('')),
  JWT_SECRET: z.string().min(8).default('emergency_response_jwt_secret_dev_key_2026!'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  REDIS_URL: z.string().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  MAPPLS_API_KEY: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(300),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables detected:', JSON.stringify(parsed.error.format(), null, 2));
  // In non-strict mode, provide fallback config to prevent startup crashes
}

export const env = parsed.success
  ? parsed.data
  : {
      NODE_ENV: 'development' as const,
      PORT: Number(process.env.PORT) || 5000,
      HOST: '0.0.0.0',
      DATABASE_URL: process.env.DATABASE_URL,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
      JWT_SECRET: process.env.JWT_SECRET || 'emergency_response_jwt_secret_dev_key_2026!',
      JWT_EXPIRES_IN: '7d',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
      REDIS_URL: process.env.REDIS_URL,
      LOG_LEVEL: 'info' as const,
      MAPPLS_API_KEY: process.env.MAPPLS_API_KEY,
      RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
      RATE_LIMIT_MAX_REQUESTS: 300,
    };
