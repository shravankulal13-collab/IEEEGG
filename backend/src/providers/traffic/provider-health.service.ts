// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: Provider Circuit Breaker & Failover Service
// ============================================================
/**
 * providerhealth.service.ts
 * Owner: Anush KD
 *
 * Circuit breaker for every external provider (Mappls routing, Mappls
 * traffic, Waze). Both fallback.provider.ts and traffic.fusion.ts report
 * successes/failures here instead of retrying blindly — this is what
 * turns "Mappls is down" into a fast, cheap skip instead of every request
 * eating a multi-second timeout waiting on a dead provider.
 *
 * States (classic circuit breaker):
 *   CLOSED     — normal operation, requests go through.
 *   OPEN       — provider tripped, requests are skipped for `openMs`.
 *   HALF_OPEN  — cooldown elapsed, next call is allowed through as a probe;
 *                success closes the breaker, failure re-opens it.
 *
 * In-memory by design for the hackathon (single backend instance). If we
 * scale to multiple instances, back this with Redis (backend/src/config/
 * redis.ts already exists under SK's ownership) using the same interface.
 */

import { logger } from '../../config/logger.js';

export type BreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface BreakerRecord {
  state: BreakerState;
  consecutiveFailures: number;
  openedAt: number | null;
  lastSuccessAt: number | null;
  lastFailureAt: number | null;
  lastLatencyMs: number | null;
}

const FAILURE_THRESHOLD = 3; // consecutive failures before tripping OPEN
const OPEN_DURATION_MS = 30_000; // stay OPEN for 30s before probing again

const registry = new Map<string, BreakerRecord>();

function getOrInit(providerName: string): BreakerRecord {
  let record = registry.get(providerName);
  if (!record) {
    record = {
      state: 'CLOSED',
      consecutiveFailures: 0,
      openedAt: null,
      lastSuccessAt: null,
      lastFailureAt: null,
      lastLatencyMs: null,
    };
    registry.set(providerName, record);
  }
  return record;
}

/** Call before attempting a request to `providerName`. */
export function isProviderOpen(providerName: string): boolean {
  const record = getOrInit(providerName);

  if (record.state === 'OPEN') {
    const elapsed = Date.now() - (record.openedAt ?? 0);
    if (elapsed >= OPEN_DURATION_MS) {
      // Cooldown elapsed — allow exactly one probe through.
      record.state = 'HALF_OPEN';
      logger.info(`circuit breaker half-open, probing provider`, { provider: providerName });
      return false;
    }
    return true;
  }

  return false;
}

export function recordProviderSuccess(providerName: string, latencyMs?: number): void {
  const record = getOrInit(providerName);
  const wasOpen = record.state !== 'CLOSED';
  record.state = 'CLOSED';
  record.consecutiveFailures = 0;
  record.openedAt = null;
  record.lastSuccessAt = Date.now();
  if (latencyMs !== undefined) record.lastLatencyMs = latencyMs;

  if (wasOpen) {
    logger.info(`circuit breaker closed — provider recovered`, { provider: providerName });
  }
}

export function recordProviderFailure(providerName: string): void {
  const record = getOrInit(providerName);
  record.consecutiveFailures += 1;
  record.lastFailureAt = Date.now();

  if (record.state === 'HALF_OPEN') {
    // Probe failed — back to OPEN immediately, no need to re-count threshold.
    record.state = 'OPEN';
    record.openedAt = Date.now();
    logger.warn(`circuit breaker re-opened — probe failed`, { provider: providerName });
    return;
  }

  if (record.consecutiveFailures >= FAILURE_THRESHOLD && record.state === 'CLOSED') {
    record.state = 'OPEN';
    record.openedAt = Date.now();
    logger.warn(`circuit breaker OPEN — provider tripped`, {
      provider: providerName,
      consecutiveFailures: record.consecutiveFailures,
    });
  }
}

export interface ProviderHealthSummary {
  provider: string;
  state: BreakerState;
  consecutiveFailures: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastLatencyMs: number | null;
}

/** Used by providerHealth.job.ts and the /api/traffic/health route for ops visibility. */
export function getAllProviderHealth(): ProviderHealthSummary[] {
  return Array.from(registry.entries()).map(([provider, r]) => ({
    provider,
    state: r.state,
    consecutiveFailures: r.consecutiveFailures,
    lastSuccessAt: r.lastSuccessAt ? new Date(r.lastSuccessAt).toISOString() : null,
    lastFailureAt: r.lastFailureAt ? new Date(r.lastFailureAt).toISOString() : null,
    lastLatencyMs: r.lastLatencyMs,
  }));
}

/** Manual override for ops/dispatcher UI ("force retry provider now"). */
export function resetProvider(providerName: string): void {
  registry.set(providerName, {
    state: 'CLOSED',
    consecutiveFailures: 0,
    openedAt: null,
    lastSuccessAt: null,
    lastFailureAt: null,
    lastLatencyMs: null,
  });
  logger.info(`circuit breaker manually reset`, { provider: providerName });
}