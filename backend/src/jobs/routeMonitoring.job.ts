// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Routing + Traffic + Resilience Engineer
// MODULE: Active Route Congestion Monitoring Job
// ============================================================
/**
 * routeMonitoring.job.ts
 * Owner: Anush KD
 *
 * For every ambulance currently EnRoute, periodically recomputes the route
 * and emits `route:reroute-suggested` over Socket.IO if traffic made the
 * current route meaningfully worse. Advisory only — drivers keep final say.
 *
 * Wire-up (in backend/src/server.ts, SK-owned):
 *   import { startRouteMonitoringJob } from './jobs/routeMonitoring.job';
 *   startRouteMonitoringJob(io); // io = shared Socket.IO server instance
 */

import type { Server as SocketIOServer } from 'socket.io';
import { query as dbQuery } from '../config/database.js';
import { logger } from '../config/logger.js';
import { resolveRoute } from '../providers/routing/fallback.provider.js';
import type { LatLng } from '../providers/routing/routing.provider.js';

const CHECK_INTERVAL_MS = 45_000; // 45s
const MIN_IMPROVEMENT_SECONDS = 90;
const MIN_IMPROVEMENT_RATIO = 0.1; // at least 10% faster

interface ActiveTripRow {
  trip_id: string;
  ambulance_id: string;
  current_lat: number;
  current_lng: number;
  destination_lat: number;
  destination_lng: number;
  active_route_duration_seconds: number;
}

async function fetchActiveTrips(): Promise<ActiveTripRow[]> {
  const result = await dbQuery<ActiveTripRow>(
    `
    SELECT
      d.id AS trip_id,
      d.ambulance_id,
      p.latitude AS current_lat,
      p.longitude AS current_lng,
      r.destination_latitude AS destination_lat,
      r.destination_longitude AS destination_lng,
      r.duration_seconds AS active_route_duration_seconds
    FROM dispatches d
    JOIN LATERAL (
      SELECT
        routes.destination_latitude,
        routes.destination_longitude,
        routes.duration_seconds
      FROM routes
      WHERE routes.dispatch_id = d.id
        AND routes.status IN ('active', 'rerouted')
      ORDER BY routes.calculated_at DESC
      LIMIT 1
    ) r ON true
    JOIN LATERAL (
      SELECT latitude, longitude
      FROM ambulance_location_history
      WHERE ambulance_id = d.ambulance_id
      ORDER BY recorded_at DESC
      LIMIT 1
    ) p ON true
    WHERE d.status IN ('accepted', 'en_route', 'arrived', 'transporting')
    `,
  );

  return result.rows;
}

async function evaluateTrip(trip: ActiveTripRow, io: SocketIOServer): Promise<void> {
  const origin: LatLng = { lat: trip.current_lat, lng: trip.current_lng };
  const destination: LatLng = { lat: trip.destination_lat, lng: trip.destination_lng };

  try {
    const fresh = await resolveRoute({ origin, destination, profile: 'emergency' });
    const freshDuration = fresh.durationInTrafficSeconds ?? fresh.durationSeconds;
    const previousDuration = trip.active_route_duration_seconds;

    if (!previousDuration || previousDuration <= 0) return;

    const improvementSeconds = previousDuration - freshDuration;
    const improvementRatio = improvementSeconds / previousDuration;

    if (improvementSeconds >= MIN_IMPROVEMENT_SECONDS && improvementRatio >= MIN_IMPROVEMENT_RATIO) {
      logger.info('reroute suggested for active trip', {
        tripId: trip.trip_id,
        ambulanceId: trip.ambulance_id,
        previousDuration,
        freshDuration,
        improvementSeconds,
        degraded: fresh.degraded,
      });

      io.to(`ambulance:${trip.ambulance_id}`).to(`trip:${trip.trip_id}`).emit('route:reroute-suggested', {
        tripId: trip.trip_id,
        ambulanceId: trip.ambulance_id,
        route: fresh,
        previousDurationSeconds: previousDuration,
        newDurationSeconds: freshDuration,
        improvementSeconds,
      });
    }
  } catch (err) {
    logger.warn('route monitoring check failed for trip', {
      tripId: trip.trip_id,
      error: (err as Error).message,
    });
  }
}

async function sweepOnce(io: SocketIOServer): Promise<void> {
  let trips: ActiveTripRow[];
  try {
    trips = await fetchActiveTrips();
  } catch (err) {
    logger.error('route monitoring sweep failed to load active trips', { err });
    return;
  }

  if (trips.length === 0) return;

  logger.debug(`route monitoring sweep evaluating ${trips.length} active trip(s)`);
  const CONCURRENCY = 5;
  for (let i = 0; i < trips.length; i += CONCURRENCY) {
    const batch = trips.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map((trip) => evaluateTrip(trip, io)));
  }
}

let intervalHandle: NodeJS.Timeout | null = null;

export function startRouteMonitoringJob(io: SocketIOServer): void {
  if (intervalHandle) {
    logger.warn('routeMonitoring.job already running, ignoring duplicate start');
    return;
  }

  logger.info('starting route monitoring job', { intervalMs: CHECK_INTERVAL_MS });
  intervalHandle = setInterval(() => {
    void sweepOnce(io);
  }, CHECK_INTERVAL_MS);
}

export function stopRouteMonitoringJob(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    logger.info('stopped route monitoring job');
  }
}