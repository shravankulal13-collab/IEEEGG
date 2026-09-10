// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch Database Repository
// ============================================================

import type { Pool } from "pg";

import {
  AmbulanceCandidate,
} from "./ambulance.scorer";

import {
  HospitalCandidate,
} from "./hospital.scorer";

import {
  RouteCandidate,
} from "./route.scorer";

export class DispatchRepository {
  constructor(
    private readonly db: Pool,
  ) {}

  /*
   * ----------------------------------------------------------
   * INCIDENT
   * ----------------------------------------------------------
   */

  async findIncidentById(
    incidentId: string,
  ): Promise<{
    latitude: number;
    longitude: number;
  } | null> {
    const result =
      await this.db.query(
        `
        SELECT
          latitude,
          longitude
        FROM incidents
        WHERE id = $1
        LIMIT 1
        `,
        [incidentId],
      );

    if (!result.rows[0]) {
      return null;
    }

    return {
      latitude: Number(
        result.rows[0].latitude,
      ),
      longitude: Number(
        result.rows[0].longitude,
      ),
    };
  }

  /*
   * ----------------------------------------------------------
   * AMBULANCES
   * ----------------------------------------------------------
   */

  async findAvailableAmbulances(
    latitude: number,
    longitude: number,
    limit = 10,
  ): Promise<AmbulanceCandidate[]> {
    const result =
      await this.db.query(
        `
        SELECT
          id,
          ambulance_number,
          status,
          emergency_capable,
          equipment,
          ST_Distance(
            location,
            ST_SetSRID(
              ST_MakePoint($2, $1),
              4326
            )::geography
          ) AS distance_meters
        FROM ambulances
        WHERE status = 'available'
          AND emergency_capable = TRUE
          AND location IS NOT NULL
        ORDER BY location <-> ST_SetSRID(
          ST_MakePoint($2, $1),
          4326
        )::geography
        LIMIT $3
        `,
        [
          latitude,
          longitude,
          limit,
        ],
      );

    return result.rows.map(
      (row) => ({
        id: row.id,

        ambulanceNumber:
          row.ambulance_number,

        status: row.status,

        emergencyCapable:
          Boolean(
            row.emergency_capable,
          ),

        equipment: row.equipment,

        distanceMeters: Number(
          row.distance_meters ?? 0,
        ),

        /*
         * ETA is supplied by routing
         * integration later.
         */
        etaSeconds: 0,
      }),
    );
  }

  /*
   * ----------------------------------------------------------
   * HOSPITALS
   * ----------------------------------------------------------
   */

  async findSuitableHospitals(
    latitude: number,
    longitude: number,
    limit = 10,
  ): Promise<HospitalCandidate[]> {
    const result =
      await this.db.query(
        `
        SELECT
          h.id,
          h.name,
          h.status,
          h.emergency_department,
          h.trauma_center,
          h.ambulance_receiving,
          h.available_beds,
          h.available_icu_beds,
          h.available_doctors,

          COALESCE(
            (
              SELECT json_agg(
                DISTINCT hd.specialization
              )
              FROM hospital_doctors hd
              WHERE hd.hospital_id = h.id
                AND hd.available = TRUE
                AND hd.on_duty = TRUE
                AND hd.specialization IS NOT NULL
            ),
            '[]'::json
          ) AS available_specializations,

          COALESCE(
            (
              SELECT json_agg(
                DISTINCT hr.resource_type
              )
              FROM hospital_resources hr
              WHERE hr.hospital_id = h.id
                AND hr.available_quantity > 0
                AND hr.status = 'available'
                AND hr.resource_type IS NOT NULL
            ),
            '[]'::json
          ) AS available_resources,

          ST_Distance(
            h.location,
            ST_SetSRID(
              ST_MakePoint($2, $1),
              4326
            )::geography
          ) AS distance_meters

        FROM hospitals h

        WHERE h.status IN (
          'active',
          'busy'
        )

          AND h.emergency_department =
            TRUE

          AND h.ambulance_receiving =
            TRUE

          AND h.location IS NOT NULL

        ORDER BY h.location <-> ST_SetSRID(
          ST_MakePoint($2, $1),
          4326
        )::geography

        LIMIT $3
        `,
        [
          latitude,
          longitude,
          limit,
        ],
      );

    return result.rows.map(
      (row) => ({
        id: row.id,

        name: row.name,

        status: row.status,

        emergencyDepartment:
          Boolean(
            row.emergency_department,
          ),

        traumaCenter:
          Boolean(
            row.trauma_center,
          ),

        ambulanceReceiving:
          Boolean(
            row.ambulance_receiving,
          ),

        availableBeds: Number(
          row.available_beds ?? 0,
        ),

        availableIcuBeds: Number(
          row.available_icu_beds ?? 0,
        ),

        availableDoctors: Number(
          row.available_doctors ?? 0,
        ),

        distanceMeters: Number(
          row.distance_meters ?? 0,
        ),

        /*
         * ETA will come from routing
         * integration.
         */
        etaSeconds: 0,

        availableSpecializations:
          Array.isArray(
            row.available_specializations,
          )
            ? row.available_specializations
            : [],

        availableResources:
          Array.isArray(
            row.available_resources,
          )
            ? row.available_resources
            : [],
      }),
    );
  }

  /*
   * ----------------------------------------------------------
   * ROUTES
   * ----------------------------------------------------------
   */

  async findRoutesForIncident(
    incidentId: string,
  ): Promise<RouteCandidate[]> {
    const result =
      await this.db.query(
        `
        SELECT
          id,
          distance_meters,
          duration_seconds,
          traffic_delay_seconds
        FROM routes
        WHERE incident_id = $1
          AND status IN (
            'planned',
            'active',
            'rerouted'
          )
        ORDER BY created_at DESC
        `,
        [incidentId],
      );

    return result.rows.map(
      (row) => ({
        id: row.id,

        distanceMeters: Number(
          row.distance_meters ?? 0,
        ),

        durationSeconds: Number(
          row.duration_seconds ?? 0,
        ),

        trafficDelaySeconds:
          Number(
            row.traffic_delay_seconds ??
              0,
          ),
      }),
    );
  }

  /*
   * ----------------------------------------------------------
   * CREATE DISPATCH
   * ----------------------------------------------------------
   */

  async createDispatch(data: {
    incidentId: string;
    ambulanceId: string;
    dispatcherId?: string;
    status?: string;
    assignmentReason?: string;
    dispatchPriority?: number;
  }) {
    const result =
      await this.db.query(
        `
        INSERT INTO dispatches (
          incident_id,
          ambulance_id,
          dispatcher_id,
          status,
          assignment_reason,
          dispatch_priority
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
        RETURNING *
        `,
        [
          data.incidentId,
          data.ambulanceId,
          data.dispatcherId ??
            null,

          data.status ??
            "pending",

          data.assignmentReason ??
            null,

          data.dispatchPriority ??
            3,
        ],
      );

    return result.rows[0];
  }

  /*
   * ----------------------------------------------------------
   * UPDATE DISPATCH
   * ----------------------------------------------------------
   */

  async updateDispatchStatus(
    dispatchId: string,
    status: string,
    reason?: string,
  ) {
    const result =
      await this.db.query(
        `
        UPDATE dispatches
        SET
          status = $2,

          rejection_reason =
            CASE
              WHEN $2 = 'rejected'
              THEN $3
              ELSE rejection_reason
            END,

          cancellation_reason =
            CASE
              WHEN $2 = 'cancelled'
              THEN $3
              ELSE cancellation_reason
            END,

          accepted_at =
            CASE
              WHEN $2 = 'accepted'
              THEN COALESCE(
                accepted_at,
                NOW()
              )
              ELSE accepted_at
            END,

          updated_at = NOW()

        WHERE id = $1

        RETURNING *
        `,
        [
          dispatchId,
          status,
          reason ?? null,
        ],
      );

    return (
      result.rows[0] ?? null
    );
  }
}

export default DispatchRepository;