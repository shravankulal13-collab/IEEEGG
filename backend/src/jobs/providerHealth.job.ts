// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: Provider Health Heartbeat Job
// ============================================================
/**
 * providerHealth.job.ts
 * Owner: Anush KD
 *
 * Runs a periodic active health probe against every routing + traffic
 * provider, independent of real request traffic.
 *
 * Wire-up (in backend/src/server.ts, SK-owned):
 *   import { startProviderHealthJob } from './jobs/providerHealth.job';
 *   startProviderHealthJob();
 */

import { logger } from '../config/logger.js';
import { mapmyIndiaRoutingProvider } from '../providers/routing/mapmyindia.provider.js';
import { osrmRoutingProvider } from '../providers/routing/fallback.provider.js';
import { mapmyIndiaTrafficProvider } from '../providers/traffic/mapmyindia.traffic.js';
import { wazeTrafficProvider } from '../providers/traffic/waze.provider.js';
import { internalTrafficProvider } from '../providers/traffic/internal.traffic.js';
import {
  getAllProviderHealth,
  recordProviderFailure,
  recordProviderSuccess,
} from '../providers/traffic/provider-health.service.js';

const PROBE_INTERVAL_MS = 20_000; // 20s — frequent enough for a live demo, cheap enough not to burn quota
const PROBE_TIMEOUT_MS = 5_000;

const PROBEABLE = [
  mapmyIndiaRoutingProvider,
  osrmRoutingProvider,
  mapmyIndiaTrafficProvider,
  wazeTrafficProvider,
  internalTrafficProvider,
];

async function probeOnce(): Promise<void> {
  await Promise.all(
    PROBEABLE.map(async (provider) => {
      const started = Date.now();
      try {
        const timeoutPromise = new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error('probe timed out')), PROBE_TIMEOUT_MS),
        );
        const healthy = await Promise.race([provider.healthCheck(), timeoutPromise]);
        const latency = Date.now() - started;

        if (healthy) {
          recordProviderSuccess(provider.name, latency);
        } else {
          recordProviderFailure(provider.name);
        }
      } catch (err) {
        recordProviderFailure(provider.name);
        logger.debug('provider health probe errored', {
          provider: provider.name,
          error: (err as Error).message,
        });
      }
    }),
  );

  const summary = getAllProviderHealth();
  const unhealthy = summary.filter((s) => s.state !== 'CLOSED');
  if (unhealthy.length > 0) {
    logger.debug('provider health sweep found degraded providers', { unhealthy });
  } else {
    logger.debug('provider health sweep: all providers healthy');
  }
}

let intervalHandle: NodeJS.Timeout | null = null;

export function startProviderHealthJob(): void {
  if (intervalHandle) {
    logger.warn('providerHealth.job already running, ignoring duplicate start');
    return;
  }

  logger.info('starting provider health job', { intervalMs: PROBE_INTERVAL_MS });
  void probeOnce();
  intervalHandle = setInterval(() => {
    void probeOnce();
  }, PROBE_INTERVAL_MS);
}

export function stopProviderHealthJob(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    logger.info('stopped provider health job');
  }
}