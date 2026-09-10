// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Facilities Repository
// ============================================================

import type { Pool } from "pg";

export interface HospitalRecord {
  id: string;
  name: string;
  status: string;

  emergencyDepartment: boolean;
  traumaCenter: boolean;
  icuAvailable: boolean;
  ambulanceReceiving: boolean;

  totalBeds: number;
  availableBeds: number;

  totalIcuBeds: number;
  availableIcuBeds: number;

  totalDoctors: number;
  availableDoctors: number;

  latitude: number | null;
  longitude: number | null;

  lastCapacityUpdate: Date | null;
}

export interface HospitalResourceRecord {
  id: string;
  hospitalId: string;
  resourceType: string;
  totalQuantity: number;
  availableQuantity: number;
  status: string;
}

export class HospitalRepository {
  constructor(
    private readonly db: Pool,
  ) {}

  /*
   * ----------------------------------------------------------
   * GET HOSPITAL BY ID
   * ----------------------------------------------------------
   */

  async findHospitalById(
    hospitalId: string,
  ): Promise<HospitalRecord | null> {
    const result =
      await this.db.query(
        `
        SELECT
          id,
          name,
          status,
          emergency_department,
          trauma_center,
          icu_available,
          ambulance_receiving,

          total_beds,
          available_beds,

          total_icu_beds,
          available_icu_beds,

          total_doctors,
          available_doctors,

          latitude,
          longitude,

          last_capacity_update

        FROM hospitals

        WHERE id = $1

        LIMIT 1
        `,
        [hospitalId],
      );

    if (!result.rows[0]) {
      return null;
    }

    return this.mapHospital(
      result.rows[0],
    );
  }

  /*
   * ----------------------------------------------------------
   * GET ACTIVE HOSPITALS
   * ----------------------------------------------------------
   */

  async findActiveHospitals(
    limit = 50,
  ): Promise<HospitalRecord[]> {
    const result =
      await this.db.query(
        `
        SELECT
          id,
          name,
          status,
          emergency_department,
          trauma_center,
          icu_available,
          ambulance_receiving,

          total_beds,
          available_beds,

          total_icu_beds,
          available_icu_beds,

          total_doctors,
          available_doctors,

          latitude,
          longitude,

          last_capacity_update

        FROM hospitals

        WHERE status IN (
          'active',
          'busy'
        )

        ORDER BY name

        LIMIT $1
        `,
        [limit],
      );

    return result.rows.map(
      (row) =>
        this.mapHospital(row),
    );
  }

  /*
   * ----------------------------------------------------------
   * UPDATE HOSPITAL STATUS
   * ----------------------------------------------------------
   */

  async updateHospitalStatus(
    hospitalId: string,
    status: string,
  ) {
    const result =
      await this.db.query(
        `
        UPDATE hospitals

        SET
          status = $2,
          updated_at = NOW()

        WHERE id = $1

        RETURNING *
        `,
        [
          hospitalId,
          status,
        ],
      );

    return result.rows[0] ?? null;
  }

  /*
   * ----------------------------------------------------------
   * UPDATE CAPACITY
   * ----------------------------------------------------------
   */

  async updateCapacity(
    hospitalId: string,
    availableBeds: number,
    availableIcuBeds: number,
    availableDoctors: number,
  ) {
    const result =
      await this.db.query(
        `
        UPDATE hospitals

        SET
          available_beds = $2,
          available_icu_beds = $3,
          available_doctors = $4,
          last_capacity_update = NOW(),
          updated_at = NOW()

        WHERE id = $1

        RETURNING *
        `,
        [
          hospitalId,
          availableBeds,
          availableIcuBeds,
          availableDoctors,
        ],
      );

    return result.rows[0] ?? null;
  }

  /*
   * ----------------------------------------------------------
   * RECORD CAPACITY HISTORY
   * ----------------------------------------------------------
   */

  async recordCapacityHistory(
    hospital: HospitalRecord,
  ) {
    await this.db.query(
      `
      INSERT INTO hospital_capacity_history (
        hospital_id,

        total_beds,
        available_beds,

        total_icu_beds,
        available_icu_beds,

        total_doctors,
        available_doctors,

        recorded_at
      )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        NOW()
      )
      `,
      [
        hospital.id,

        hospital.totalBeds,
        hospital.availableBeds,

        hospital.totalIcuBeds,
        hospital.availableIcuBeds,

        hospital.totalDoctors,
        hospital.availableDoctors,
      ],
    );
  }

  /*
   * ----------------------------------------------------------
   * GET HOSPITAL RESOURCES
   * ----------------------------------------------------------
   */

  async findResources(
    hospitalId: string,
  ): Promise<HospitalResourceRecord[]> {
    const result =
      await this.db.query(
        `
        SELECT
          id,
          hospital_id,
          resource_type,
          total_quantity,
          available_quantity,
          status

        FROM hospital_resources

        WHERE hospital_id = $1

        ORDER BY resource_type
        `,
        [hospitalId],
      );

    return result.rows.map(
      (row) => ({
        id: row.id,
        hospitalId:
          row.hospital_id,

        resourceType:
          row.resource_type,

        totalQuantity: Number(
          row.total_quantity ?? 0,
        ),

        availableQuantity:
          Number(
            row.available_quantity ??
              0,
          ),

        status: row.status,
      }),
    );
  }

  /*
   * ----------------------------------------------------------
   * UPDATE RESOURCE
   * ----------------------------------------------------------
   */

  async updateResource(
    hospitalId: string,
    resourceType: string,
    totalQuantity: number,
    availableQuantity: number,
    status: string,
  ) {
    const result =
      await this.db.query(
        `
        INSERT INTO hospital_resources (
          hospital_id,
          resource_type,
          total_quantity,
          available_quantity,
          status,
          last_updated_at
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          NOW()
        )

        ON CONFLICT (
          hospital_id,
          resource_type
        )

        DO UPDATE SET
          total_quantity =
            EXCLUDED.total_quantity,

          available_quantity =
            EXCLUDED.available_quantity,

          status =
            EXCLUDED.status,

          last_updated_at =
            NOW()

        RETURNING *
        `,
        [
          hospitalId,
          resourceType,
          totalQuantity,
          availableQuantity,
          status,
        ],
      );

    return result.rows[0] ?? null;
  }

  /*
   * ----------------------------------------------------------
   * SPECIALISTS
   * ----------------------------------------------------------
   */

  async findAvailableSpecializations(
    hospitalId: string,
  ): Promise<string[]> {
    const result =
      await this.db.query(
        `
        SELECT DISTINCT
          specialization

        FROM hospital_doctors

        WHERE hospital_id = $1
          AND available = TRUE
          AND on_duty = TRUE
          AND specialization IS NOT NULL

        ORDER BY specialization
        `,
        [hospitalId],
      );

    return result.rows.map(
      (row) =>
        row.specialization,
    );
  }

  /*
   * ----------------------------------------------------------
   * BED COUNTS
   * ----------------------------------------------------------
   */

  async countBedsByStatus(
    hospitalId: string,
  ) {
    const result =
      await this.db.query(
        `
        SELECT
          bed_type,
          status,
          COUNT(*)::int AS count

        FROM hospital_beds

        WHERE hospital_id = $1

        GROUP BY
          bed_type,
          status

        ORDER BY
          bed_type,
          status
        `,
        [hospitalId],
      );

    return result.rows.map(
      (row) => ({
        bedType: row.bed_type,
        status: row.status,
        count: Number(
          row.count,
        ),
      }),
    );
  }

  /*
   * ----------------------------------------------------------
   * MAPPER
   * ----------------------------------------------------------
   */

  private mapHospital(
    row: any,
  ): HospitalRecord {
    return {
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

      icuAvailable:
        Boolean(
          row.icu_available,
        ),

      ambulanceReceiving:
        Boolean(
          row.ambulance_receiving,
        ),

      totalBeds: Number(
        row.total_beds ?? 0,
      ),

      availableBeds: Number(
        row.available_beds ?? 0,
      ),

      totalIcuBeds: Number(
        row.total_icu_beds ?? 0,
      ),

      availableIcuBeds:
        Number(
          row.available_icu_beds ??
            0,
        ),

      totalDoctors: Number(
        row.total_doctors ?? 0,
      ),

      availableDoctors:
        Number(
          row.available_doctors ??
            0,
        ),

      latitude:
        row.latitude === null
          ? null
          : Number(row.latitude),

      longitude:
        row.longitude === null
          ? null
          : Number(row.longitude),

      lastCapacityUpdate:
        row.last_capacity_update ??
        null,
    };
  }
}

export default HospitalRepository;