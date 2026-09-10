// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Facilities Repository
// ============================================================

import { query } from '../../config/database';

export class HospitalRepository {
  public async getHospitalById(id: string) {
    const result = await query('SELECT * FROM hospitals WHERE id = $1', [id]);
    return result.rows[0];
  }

  public async updateCapacity(id: string, field: string, count: number) {
    const result = await query(
      `UPDATE hospitals SET "${field}" = $1 WHERE id = $2 RETURNING *`, 
      [count, id]
    );
    return result.rows[0];
  }

  public async decrementBedCount(id: string, type: 'ICU' | 'EMERGENCY') {
    const field = type === 'ICU' ? 'availableICUBeds' : 'availableEmergencyBeds';
    const result = await query(`
      UPDATE hospitals SET "${field}" = "${field}" - 1 
      WHERE id = $1 AND "${field}" > 0 
      RETURNING *
    `, [id]);
    
    return result.rows[0];
  }

  public async updateSpecialists(id: string, specialists: string[]) {
    const result = await query(
      'UPDATE hospitals SET "onCallSpecialists" = $1 WHERE id = $2', 
      [JSON.stringify(specialists), id]
    );
    return result.rowCount; 
  }
}