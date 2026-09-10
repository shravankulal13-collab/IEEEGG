// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Resource Validation Schemas
// ============================================================

import { z } from "zod";

export const hospitalIdSchema = z.object({
  hospitalId: z.string().uuid(),
});

export const hospitalStatusSchema = z.object({
  status: z.enum([
    "active",
    "busy",
    "temporarily_unavailable",
    "offline",
  ]),
});

export const hospitalCapacityUpdateSchema =
  z.object({
    hospitalId: z.string().uuid(),

    availableBeds: z
      .number()
      .int()
      .min(0),

    availableIcuBeds: z
      .number()
      .int()
      .min(0),

    availableDoctors: z
      .number()
      .int()
      .min(0),
  });

export const hospitalResourceUpdateSchema =
  z.object({
    hospitalId: z.string().uuid(),

    resourceType: z
      .string()
      .trim()
      .min(1)
      .max(100),

    totalQuantity: z
      .number()
      .int()
      .min(0),

    availableQuantity: z
      .number()
      .int()
      .min(0),

    status: z
      .enum([
        "available",
        "occupied",
        "maintenance",
        "unavailable",
      ])
      .optional(),
  }).refine(
    (data) =>
      data.availableQuantity <=
      data.totalQuantity,
    {
      message:
        "Available quantity cannot exceed total quantity",
      path: ["availableQuantity"],
    },
  );

export const hospitalSearchSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  limit: z.number().int().min(1).max(50).optional(),
});

export const hospitalTriageSchema = z.object({
  hospitalId: z.string().uuid(),

  requiresIcu:
    z.boolean().optional(),

  requiresTraumaCare:
    z.boolean().optional(),

  requiredSpecialization:
    z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional(),

  requiredResources:
    z
      .array(
        z.string().trim().min(1),
      )
      .optional(),
});

export type HospitalCapacityUpdateRequest =
  z.infer<
    typeof hospitalCapacityUpdateSchema
  >;

export type HospitalResourceUpdateRequest =
  z.infer<
    typeof hospitalResourceUpdateSchema
  >;

export type HospitalTriageRequest =
  z.infer<
    typeof hospitalTriageSchema
  >;