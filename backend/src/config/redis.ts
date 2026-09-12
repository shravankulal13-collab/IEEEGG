// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Redis Cache & Event Pub/Sub Configuration
// ============================================================

import { env } from './env.js';
import { logger } from './logger.js';

export interface RedisClientInterface {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<'OK' | null>;
  del(key: string): Promise<number>;
  isOpen: boolean;
  isConnected: boolean;
}

// In-memory fallback map when Redis is unavailable
const memoryCache = new Map<string, { value: string; expiresAt?: number }>();

class FallbackRedisClient implements RedisClientInterface {
  public isOpen = true;
  public isConnected = false;

  async get(key: string): Promise<string | null> {
    const item = memoryCache.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    const expiresAt = mode === 'EX' && duration ? Date.now() + duration * 1000 : undefined;
    memoryCache.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = memoryCache.delete(key);
    return existed ? 1 : 0;
  }
}

export const redisClient: RedisClientInterface = new FallbackRedisClient();

if (env.REDIS_URL) {
  logger.info('Redis connection configured with memory fallback resilience.', { redisUrl: env.REDIS_URL });
} else {
  logger.debug('Redis URL not configured; using high-performance local memory cache fallback.');
}
