// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Authentication & Profile Data Access Repository
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import { query } from '../../config/database.js';
import type { UserRole } from '../../middleware/role.middleware.js';

export interface UserProfileRecord {
  id: string;
  full_name: string;
  phone: string | null;
  email: string;
  password_hash?: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class AuthRepository {
  async findByEmail(email: string): Promise<UserProfileRecord | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const res = await query<UserProfileRecord>(
      'SELECT * FROM profiles WHERE LOWER(email) = $1 LIMIT 1',
      [normalizedEmail]
    );
    return res.rows[0] || null;
  }

  async findById(id: string): Promise<UserProfileRecord | null> {
    const res = await query<UserProfileRecord>(
      'SELECT * FROM profiles WHERE id = $1 LIMIT 1',
      [id]
    );
    return res.rows[0] || null;
  }

  async create(data: {
    fullName: string;
    email: string;
    phone?: string;
    passwordHash: string;
    role: UserRole;
  }): Promise<UserProfileRecord> {
    const normalizedEmail = data.email.toLowerCase().trim();
    const id = uuidv4();
    const now = new Date();

    const res = await query<UserProfileRecord>(
      `INSERT INTO profiles (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, $7, $7)
       RETURNING *`,
      [id, data.fullName, normalizedEmail, data.phone || null, data.passwordHash, data.role, now]
    );

    return res.rows[0] || {
      id,
      full_name: data.fullName,
      email: normalizedEmail,
      phone: data.phone || null,
      password_hash: data.passwordHash,
      role: data.role,
      is_active: true,
      created_at: now,
      updated_at: now,
    };
  }

  async updateProfile(id: string, data: { fullName?: string; phone?: string }): Promise<UserProfileRecord | null> {
    const user = await this.findById(id);
    if (!user) return null;

    const res = await query<UserProfileRecord>(
      'UPDATE profiles SET full_name = $1, phone = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [data.fullName ?? user.full_name, data.phone ?? user.phone, id]
    );

    return res.rows[0] || user;
  }

  async count(): Promise<number> {
    const res = await query<{ count: string }>('SELECT COUNT(*) as count FROM profiles');
    return parseInt(res.rows[0]?.count || '0', 10);
  }
}

export const authRepository = new AuthRepository();
