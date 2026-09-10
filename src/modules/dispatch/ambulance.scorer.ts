// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Ambulance Suitability Scoring
// ============================================================

export interface AmbulanceCandidate {
  id: string;
  ambulanceNumber?: string;
  status: string;
  emergencyCapable: boolean;
  equipment?: unknown;
  distanceMeters: number;
  etaSeconds: number;
}

export interface AmbulanceRequirements {
  requiredEquipment?: string[];
}

export interface ScoredAmbulance
  extends AmbulanceCandidate {
  score: number;
  equipmentMatchScore: number;
  reasons: string[];
}

function normalizeEquipment(
  equipment: unknown,
): string[] {
  if (Array.isArray(equipment)) {
    return equipment
      .map(String)
      .map((item) => item.toLowerCase().trim());
  }

  if (
    equipment &&
    typeof equipment === "object"
  ) {
    return Object.entries(equipment)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key.toLowerCase().trim());
  }

  return [];
}

export function scoreAmbulance(
  ambulance: AmbulanceCandidate,
  requirements: AmbulanceRequirements = {},
  bestEtaSeconds: number,
  bestDistanceMeters: number,
): ScoredAmbulance {
  /*
   * If ETA is available, use ETA.
   * If ETA is 0/unavailable, use distance as the
   * practical fallback.
   */
  const etaScore =
    bestEtaSeconds > 0 &&
    ambulance.etaSeconds > 0
      ? Math.min(
          (bestEtaSeconds /
            ambulance.etaSeconds) *
            100,
          100,
        )
      : 0;

  const distanceScore =
    bestDistanceMeters > 0 &&
    ambulance.distanceMeters >= 0
      ? Math.min(
          (bestDistanceMeters /
            Math.max(
              ambulance.distanceMeters,
              1,
            )) *
            100,
          100,
        )
      : 0;

  const availableEquipment =
    normalizeEquipment(
      ambulance.equipment,
    );

  const requiredEquipment = (
    requirements.requiredEquipment ?? []
  ).map((item) =>
    item.toLowerCase().trim(),
  );

  let equipmentMatchScore = 100;

  if (requiredEquipment.length > 0) {
    const matchedEquipment =
      requiredEquipment.filter(
        (equipment) =>
          availableEquipment.includes(
            equipment,
          ),
      );

    equipmentMatchScore =
      (matchedEquipment.length /
        requiredEquipment.length) *
      100;
  }

  const capabilityScore =
    ambulance.emergencyCapable ? 100 : 0;

  /*
   * If ETA is unavailable, redistribute the ETA
   * weight to distance.
   */
  const score =
    bestEtaSeconds > 0
      ? etaScore * 0.4 +
        distanceScore * 0.25 +
        equipmentMatchScore * 0.2 +
        capabilityScore * 0.15
      : distanceScore * 0.65 +
        equipmentMatchScore * 0.2 +
        capabilityScore * 0.15;

  const reasons: string[] = [];

  if (
    bestEtaSeconds > 0 &&
    ambulance.etaSeconds ===
      bestEtaSeconds
  ) {
    reasons.push(
      "Lowest estimated arrival time",
    );
  }

  if (
    ambulance.distanceMeters ===
    bestDistanceMeters
  ) {
    reasons.push(
      "Closest available ambulance",
    );
  }

  if (
    requiredEquipment.length > 0 &&
    equipmentMatchScore === 100
  ) {
    reasons.push(
      "All required emergency equipment available",
    );
  } else if (
    requiredEquipment.length > 0 &&
    equipmentMatchScore > 0
  ) {
    reasons.push(
      "Some required emergency equipment available",
    );
  } else if (
    requiredEquipment.length > 0 &&
    equipmentMatchScore === 0
  ) {
    reasons.push(
      "Required emergency equipment unavailable",
    );
  }

  if (ambulance.emergencyCapable) {
    reasons.push(
      "Emergency-capable ambulance",
    );
  }

  return {
    ...ambulance,
    score: Number(
      Math.min(score, 100).toFixed(2),
    ),
    equipmentMatchScore: Number(
      equipmentMatchScore.toFixed(2),
    ),
    reasons,
  };
}