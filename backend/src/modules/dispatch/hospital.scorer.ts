// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Suitability Scoring
// ============================================================

export interface HospitalCandidate {
  id: string;
  name: string;
  status: string;
  emergencyDepartment: boolean;
  traumaCenter: boolean;
  ambulanceReceiving: boolean;

  availableBeds: number;
  availableIcuBeds: number;
  availableDoctors: number;

  distanceMeters: number;
  etaSeconds: number;

  availableSpecializations?: string[];
  availableResources?: string[];
}

export interface HospitalRequirements {
  requiresIcu?: boolean;
  requiresTraumaCare?: boolean;
  requiredSpecialization?: string;
  requiredResources?: string[];
}

export interface ScoredHospital
  extends HospitalCandidate {
  score: number;
  capacityScore: number;
  specialistScore: number;
  resourceScore: number;
  reasons: string[];
}

export function scoreHospital(
  hospital: HospitalCandidate,
  requirements: HospitalRequirements = {},
  bestEtaSeconds: number,
): ScoredHospital {
  let capacityScore: number;

  if (requirements.requiresIcu) {
    capacityScore =
      hospital.availableIcuBeds > 0 ? 100 : 0;
  } else {
    capacityScore =
      hospital.availableBeds > 0 ? 100 : 0;
  }

  if (!hospital.emergencyDepartment) {
    capacityScore = 0;
  }

  let specialistScore = 100;

  if (requirements.requiredSpecialization) {
    const required =
      requirements.requiredSpecialization.toLowerCase();

    const specializations = (
      hospital.availableSpecializations ?? []
    ).map((item) => item.toLowerCase());

    specialistScore = specializations.includes(required)
      ? 100
      : 0;
  }

  let resourceScore = 100;

  const requiredResources =
    requirements.requiredResources ?? [];

  if (requiredResources.length > 0) {
    const availableResources = (
      hospital.availableResources ?? []
    ).map((item) => item.toLowerCase());

    const matchedResources =
      requiredResources.filter((resource) =>
        availableResources.includes(
          resource.toLowerCase(),
        ),
      );

    resourceScore =
      (matchedResources.length /
        requiredResources.length) *
      100;
  }

  let operationalScore = 0;

  if (
    hospital.status === "active" &&
    hospital.ambulanceReceiving
  ) {
    operationalScore = 100;
  } else if (
    hospital.status === "busy" &&
    hospital.ambulanceReceiving
  ) {
    operationalScore = 70;
  }

  if (
    requirements.requiresTraumaCare &&
    !hospital.traumaCenter
  ) {
    specialistScore = 0;
  }

  const etaScore =
    bestEtaSeconds > 0
      ? Math.min(
          (bestEtaSeconds /
            Math.max(hospital.etaSeconds, 1)) *
            100,
          100,
        )
      : 0;

  const score =
    capacityScore * 0.3 +
    etaScore * 0.25 +
    resourceScore * 0.2 +
    specialistScore * 0.15 +
    operationalScore * 0.1;

  const reasons: string[] = [];

  if (
    requirements.requiresIcu &&
    hospital.availableIcuBeds > 0
  ) {
    reasons.push("ICU bed available");
  } else if (
    !requirements.requiresIcu &&
    hospital.availableBeds > 0
  ) {
    reasons.push("Emergency bed available");
  }

  if (hospital.etaSeconds === bestEtaSeconds) {
    reasons.push(
      "Lowest estimated hospital arrival time",
    );
  }

  if (
    requiredResources.length > 0 &&
    resourceScore === 100
  ) {
    reasons.push(
      "Required medical resources available",
    );
  }

  if (
    requirements.requiredSpecialization &&
    specialistScore === 100
  ) {
    reasons.push("Required specialist available");
  }

  if (
    requirements.requiresTraumaCare &&
    hospital.traumaCenter
  ) {
    reasons.push("Trauma care available");
  }

  if (hospital.status === "active") {
    reasons.push("Hospital operational");
  }

  return {
    ...hospital,
    score: Number(Math.min(score, 100).toFixed(2)),
    capacityScore: Number(capacityScore.toFixed(2)),
    specialistScore: Number(
      specialistScore.toFixed(2),
    ),
    resourceScore: Number(resourceScore.toFixed(2)),
    reasons,
  };
}