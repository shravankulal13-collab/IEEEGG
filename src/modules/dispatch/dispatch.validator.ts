// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch Request Validation
// ============================================================

import { z } from "zod";

export const ambulanceRequirementsSchema =
  z.object({
    requiredEquipment: z
      .array(
        z.string().trim().min(1),
      )
      .optional(),
  });

export const hospitalRequirementsSchema =
  z.object({
    requiresIcu:
      z.boolean().optional(),

    requiresTraumaCare:
      z.boolean().optional(),

    requiredSpecialization:
      z
        .string()
        .trim()
        .min(1)
        .optional(),

    requiredResources:
      z
        .array(
          z.string().trim().min(1),
        )
        .optional(),
  });

export const dispatchRecommendationSchema =
  z.object({
    incidentId:
      z.string().uuid(),

    ambulanceRequirements:
      ambulanceRequirementsSchema
        .optional(),

    hospitalRequirements:
      hospitalRequirementsSchema
        .optional(),
  });

export const dispatchDecisionSchema =
  z.object({
    dispatchId:
      z.string().uuid(),

    action: z.enum([
      "accept",
      "reject",
      "cancel",
      "reassign",
    ]),

    reason:
      z
        .string()
        .trim()
        .min(1)
        .max(500)
        .optional(),
  });

export type DispatchRecommendationRequest =
  z.infer<
    typeof dispatchRecommendationSchema
  >;

export type DispatchDecisionRequest =
  z.infer<
    typeof dispatchDecisionSchema
  >;

export function validateDispatchRecommendation(
  data: unknown,
): DispatchRecommendationRequest {
  return dispatchRecommendationSchema.parse(
    data,
  );
}

export function validateDispatchDecision(
  data: unknown,
): DispatchDecisionRequest {
  return dispatchDecisionSchema.parse(
    data,
  );
}