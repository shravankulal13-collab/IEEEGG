// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch Decision Engine
// ============================================================

import {
  AmbulanceCandidate,
  AmbulanceRequirements,
  ScoredAmbulance,
  scoreAmbulance,
} from "./ambulance.scorer";

import {
  HospitalCandidate,
  HospitalRequirements,
  ScoredHospital,
  scoreHospital,
} from "./hospital.scorer";

import {
  RouteCandidate,
  ScoredRoute,
  scoreRoute,
} from "./route.scorer";

export interface DispatchRequest {
  ambulanceRequirements?: AmbulanceRequirements;
  hospitalRequirements?: HospitalRequirements;
}

export interface DispatchEngineInput {
  ambulances: AmbulanceCandidate[];
  hospitals: HospitalCandidate[];
  routes?: RouteCandidate[];
  request?: DispatchRequest;
}

export interface DispatchRecommendation {
  recommendedAmbulance: ScoredAmbulance | null;
  recommendedHospital: ScoredHospital | null;
  recommendedRoute: ScoredRoute | null;

  ambulanceAlternatives: ScoredAmbulance[];
  hospitalAlternatives: ScoredHospital[];
  routeAlternatives: ScoredRoute[];

  recommendationReasons: string[];
}

export function generateDispatchRecommendation(
  input: DispatchEngineInput,
): DispatchRecommendation {
  const {
    ambulances,
    hospitals,
    routes = [],
    request = {},
  } = input;

  /*
   * ----------------------------------------------------------
   * AMBULANCE
   * ----------------------------------------------------------
   */

  const eligibleAmbulances =
    ambulances.filter(
      (ambulance) =>
        ambulance.status ===
          "available" &&
        ambulance.emergencyCapable,
    );

  const validAmbulanceEtas =
    eligibleAmbulances
      .map(
        (ambulance) =>
          ambulance.etaSeconds,
      )
      .filter(
        (eta) => eta > 0,
      );

  const actualBestAmbulanceEta =
    validAmbulanceEtas.length > 0
      ? Math.min(
          ...validAmbulanceEtas,
        )
      : 0;

  const bestAmbulanceDistance =
    eligibleAmbulances.length > 0
      ? Math.min(
          ...eligibleAmbulances.map(
            (ambulance) =>
              ambulance.distanceMeters,
          ),
        )
      : 0;

  const scoredAmbulances =
    eligibleAmbulances
      .map((ambulance) =>
        scoreAmbulance(
          ambulance,
          request.ambulanceRequirements,
          actualBestAmbulanceEta,
          bestAmbulanceDistance,
        ),
      )
      .sort(
        (a, b) => b.score - a.score,
      );

  /*
   * ----------------------------------------------------------
   * HOSPITAL
   * ----------------------------------------------------------
   */

  const eligibleHospitals =
    hospitals.filter(
      (hospital) =>
        hospital.emergencyDepartment &&
        hospital.ambulanceReceiving &&
        hospital.status !== "offline",
    );

  const validHospitalEtas =
    eligibleHospitals
      .map(
        (hospital) =>
          hospital.etaSeconds,
      )
      .filter(
        (eta) => eta > 0,
      );

  const bestHospitalEta =
    validHospitalEtas.length > 0
      ? Math.min(
          ...validHospitalEtas,
        )
      : 0;

  const scoredHospitals =
    eligibleHospitals
      .map((hospital) =>
        scoreHospital(
          hospital,
          request.hospitalRequirements,
          bestHospitalEta,
        ),
      )
      .sort(
        (a, b) => b.score - a.score,
      );

  /*
   * ----------------------------------------------------------
   * ROUTES
   * ----------------------------------------------------------
   */

  const bestRouteDuration =
    routes.length > 0
      ? Math.min(
          ...routes.map(
            (route) =>
              route.durationSeconds,
          ),
        )
      : 0;

  const bestRouteDistance =
    routes.length > 0
      ? Math.min(
          ...routes.map(
            (route) =>
              route.distanceMeters,
          ),
        )
      : 0;

  const validTrafficDelays =
    routes
      .map(
        (route) =>
          route.trafficDelaySeconds ??
          0,
      )
      .filter(
        (delay) => delay >= 0,
      );

  const bestTrafficDelay =
    validTrafficDelays.length > 0
      ? Math.min(
          ...validTrafficDelays,
        )
      : 0;

  const scoredRoutes =
    routes
      .map((route) =>
        scoreRoute(
          route,
          bestRouteDuration,
          bestRouteDistance,
          bestTrafficDelay,
        ),
      )
      .sort(
        (a, b) => b.score - a.score,
      );

  /*
   * ----------------------------------------------------------
   * FINAL RECOMMENDATIONS
   * ----------------------------------------------------------
   */

  const recommendedAmbulance =
    scoredAmbulances[0] ?? null;

  const recommendedHospital =
    scoredHospitals[0] ?? null;

  const recommendedRoute =
    scoredRoutes[0] ?? null;

  const recommendationReasons: string[] =
    [];

  if (recommendedAmbulance) {
    recommendationReasons.push(
      `Ambulance ${
        recommendedAmbulance.ambulanceNumber ??
        recommendedAmbulance.id
      } selected with score ${
        recommendedAmbulance.score
      }`,
    );

    recommendationReasons.push(
      ...recommendedAmbulance.reasons,
    );
  }

  if (recommendedHospital) {
    recommendationReasons.push(
      `Hospital ${
        recommendedHospital.name
      } selected with score ${
        recommendedHospital.score
      }`,
    );

    recommendationReasons.push(
      ...recommendedHospital.reasons,
    );
  }

  if (recommendedRoute) {
    recommendationReasons.push(
      `Route selected with score ${
        recommendedRoute.score
      }`,
    );

    recommendationReasons.push(
      ...recommendedRoute.reasons,
    );
  }

  return {
    recommendedAmbulance,
    recommendedHospital,
    recommendedRoute,

    ambulanceAlternatives:
      scoredAmbulances.slice(1),

    hospitalAlternatives:
      scoredHospitals.slice(1),

    routeAlternatives:
      scoredRoutes.slice(1),

    recommendationReasons: [
      ...new Set(
        recommendationReasons,
      ),
    ],
  };
}