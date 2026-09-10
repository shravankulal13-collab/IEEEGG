// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Route Suitability Scoring
// ============================================================

export interface RouteCandidate {
  id?: string;
  distanceMeters: number;
  durationSeconds: number;
  trafficDelaySeconds?: number;
}

export interface ScoredRoute
  extends RouteCandidate {
  score: number;
  reasons: string[];
}

export function scoreRoute(
  route: RouteCandidate,
  bestDurationSeconds: number,
  bestDistanceMeters: number,
  bestTrafficDelaySeconds: number,
): ScoredRoute {
  const durationScore =
    bestDurationSeconds > 0
      ? Math.min(
          (bestDurationSeconds /
            Math.max(
              route.durationSeconds,
              1,
            )) *
            100,
          100,
        )
      : 0;

  const distanceScore =
    bestDistanceMeters > 0
      ? Math.min(
          (bestDistanceMeters /
            Math.max(
              route.distanceMeters,
              1,
            )) *
            100,
          100,
        )
      : 0;

  const trafficDelay =
    route.trafficDelaySeconds ?? 0;

  let trafficScore = 100;

  if (bestTrafficDelaySeconds > 0) {
    if (trafficDelay === 0) {
      trafficScore = 100;
    } else {
      trafficScore = Math.min(
        (bestTrafficDelaySeconds /
          trafficDelay) *
          100,
        100,
      );
    }
  } else if (trafficDelay > 0) {
    trafficScore = 50;
  }

  const score =
    durationScore * 0.5 +
    distanceScore * 0.3 +
    trafficScore * 0.2;

  const reasons: string[] = [];

  if (
    route.durationSeconds ===
    bestDurationSeconds
  ) {
    reasons.push(
      "Lowest estimated travel time",
    );
  }

  if (
    route.distanceMeters ===
    bestDistanceMeters
  ) {
    reasons.push(
      "Shortest route distance",
    );
  }

  if (trafficDelay === 0) {
    reasons.push(
      "No reported traffic delay",
    );
  } else if (
    trafficDelay ===
    bestTrafficDelaySeconds
  ) {
    reasons.push(
      "Lowest traffic delay",
    );
  }

  return {
    ...route,
    score: Number(
      Math.min(score, 100).toFixed(2),
    ),
    reasons,
  };
}