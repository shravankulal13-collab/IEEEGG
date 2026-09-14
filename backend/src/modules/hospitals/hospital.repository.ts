import { query } from '../../config/database';

export class HospitalRepository {
  public async getAllHospitals() {
    const result = await query('SELECT * FROM hospitals WHERE status = \'active\' OR status IS NULL OR active = true ORDER BY name ASC');
    return result.rows;
  }

  public async getHospitalById(id: string) {
    const result = await query('SELECT * FROM hospitals WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  public async getDoctors(hospitalId: string) {
    const result = await query(
      'SELECT * FROM hospital_doctors WHERE hospital_id = $1 ORDER BY name ASC',
      [hospitalId]
    );
    return result.rows;
  }

  public async getAllDoctors() {
    const result = await query(`
      SELECT hd.*, h.name as hospital_name 
      FROM hospital_doctors hd
      LEFT JOIN hospitals h ON hd.hospital_id = h.id
      ORDER BY hd.name ASC
    `);
    return result.rows;
  }

  public async createDoctor(data: {
    hospitalId: string;
    name: string;
    specialization: string;
    department?: string;
    phone?: string;
    available?: boolean;
    onDuty?: boolean;
  }) {
    const result = await query(`
      INSERT INTO hospital_doctors (
        id, hospital_id, name, specialization, department, phone, available, on_duty, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
      ) RETURNING *
    `, [
      data.hospitalId,
      data.name,
      data.specialization,
      data.department || 'Emergency Medicine',
      data.phone || '+919800000000',
      data.available !== undefined ? data.available : true,
      data.onDuty !== undefined ? data.onDuty : true,
    ]);
    return result.rows[0];
  }

  public async updateDoctor(doctorId: string, updates: Partial<{
    name: string;
    specialization: string;
    department: string;
    phone: string;
    available: boolean;
    on_duty: boolean;
  }>) {
    const keys = Object.keys(updates);
    if (keys.length === 0) return null;

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(updates)) {
      setClauses.push(`"${key}" = $${idx++}`);
      values.push(val);
    }
    values.push(doctorId);

    const result = await query(`
      UPDATE hospital_doctors 
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING *
    `, values);
    return result.rows[0] || null;
  }

  public async deleteDoctor(doctorId: string) {
    const result = await query('DELETE FROM hospital_doctors WHERE id = $1 RETURNING id', [doctorId]);
    return (result.rowCount ?? 0) > 0;
  }

  public async getResources(hospitalId: string) {
    const result = await query(
      'SELECT * FROM hospital_resources WHERE hospital_id = $1 ORDER BY resource_type ASC',
      [hospitalId]
    );
    return result.rows;
  }

  public async updateResource(resourceId: string, availableQuantity: number, totalQuantity?: number) {
    let sql = 'UPDATE hospital_resources SET available_quantity = $1, last_updated_at = NOW() WHERE id = $2 RETURNING *';
    let params: any[] = [availableQuantity, resourceId];

    if (totalQuantity !== undefined) {
      sql = 'UPDATE hospital_resources SET available_quantity = $1, total_quantity = $2, last_updated_at = NOW() WHERE id = $3 RETURNING *';
      params = [availableQuantity, totalQuantity, resourceId];
    }

    const result = await query(sql, params);
    return result.rows[0] || null;
  }

  public async updateCapacity(id: string, field: string, count: number) {
    // Synchronize both camelCase and snake_case columns
    let snakeField = field;
    if (field === 'availableICUBeds') snakeField = 'available_icu_beds';
    if (field === 'availableEmergencyBeds') snakeField = 'available_beds';

    const result = await query(
      `UPDATE hospitals SET "${field}" = $1, "${snakeField}" = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, 
      [count, id]
    );
    return result.rows[0];
  }

  public async updateHospitalMetrics(id: string, data: {
    available_beds?: number;
    total_beds?: number;
    available_icu_beds?: number;
    total_icu_beds?: number;
    available_doctors?: number;
    total_doctors?: number;
  }) {
    const sets: string[] = [];
    const vals: any[] = [];
    let i = 1;

    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) {
        sets.push(`"${k}" = $${i++}`);
        vals.push(v);
        if (k === 'available_beds') {
          sets.push(`"availableEmergencyBeds" = $${i++}`);
          vals.push(v);
        }
        if (k === 'available_icu_beds') {
          sets.push(`"availableICUBeds" = $${i++}`);
          vals.push(v);
        }
      }
    }
    vals.push(id);

    const result = await query(`
      UPDATE hospitals SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *
    `, vals);
    return result.rows[0] || null;
  }

  public async decrementBedCount(id: string, type: 'ICU' | 'EMERGENCY') {
    const field = type === 'ICU' ? 'availableICUBeds' : 'availableEmergencyBeds';
    const snake = type === 'ICU' ? 'available_icu_beds' : 'available_beds';
    const result = await query(`
      UPDATE hospitals SET "${field}" = GREATEST(0, "${field}" - 1), "${snake}" = GREATEST(0, "${snake}" - 1), updated_at = NOW()
      WHERE id = $1 AND "${field}" > 0 
      RETURNING *
    `, [id]);
    
    return result.rows[0];
  }

  public async updateSpecialists(id: string, specialists: string[]) {
    const result = await query(
      'UPDATE hospitals SET "onCallSpecialists" = $1, updated_at = NOW() WHERE id = $2', 
      [JSON.stringify(specialists), id]
    );
    return result.rowCount; 
  }
}