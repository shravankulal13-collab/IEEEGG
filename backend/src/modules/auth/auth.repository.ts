// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Authentication & Profile Data Access Repository
// ============================================================

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { isPostgresConnected, pool, query } from '../../config/database.js';
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

// Resilient in-memory store for development/fallback mode
const fallbackUsers = new Map<string, UserProfileRecord>();

const defaultSeedPasswordHash = bcrypt.hashSync('Emergency123!', 10);

// Pre-populate fallback seed accounts
const initialSeedUsers: UserProfileRecord[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    full_name: 'Admin Officer',
    phone: '+919876543210',
    email: 'admin@emergency.gov.in',
    password_hash: defaultSeedPasswordHash,
    role: 'system_admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    full_name: 'Chief Dispatcher',
    phone: '+919876543211',
    email: 'dispatcher@emergency.gov.in',
    password_hash: defaultSeedPasswordHash,
    role: 'dispatcher',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    full_name: 'Ambulance Operator',
    phone: '+919876543212',
    email: 'ambulance@emergency.gov.in',
    password_hash: defaultSeedPasswordHash,
    role: 'ambulance_driver',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    full_name: 'Hospital Administrator',
    phone: '+919876543213',
    email: 'hospital@emergency.gov.in',
    password_hash: defaultSeedPasswordHash,
    role: 'hospital_admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    full_name: 'Citizen Reporter',
    phone: '+919876543214',
    email: 'citizen@emergency.gov.in',
    password_hash: defaultSeedPasswordHash,
    role: 'citizen',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  // Example.com standard demo accounts
  {
    id: 'a0000000-0000-0000-0000-000000000006',
    full_name: 'Pavana Murthy',
    phone: '+919876543215',
    email: 'citizen@example.com',
    password_hash: defaultSeedPasswordHash,
    role: 'citizen',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000007',
    full_name: 'Manjunath Gowda (Paramedic Driver)',
    phone: '+919876543216',
    email: 'driver@example.com',
    password_hash: defaultSeedPasswordHash,
    role: 'ambulance_driver',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000008',
    full_name: 'Vikram Mehta (Chief Dispatcher)',
    phone: '+919876543217',
    email: 'dispatcher@example.com',
    password_hash: defaultSeedPasswordHash,
    role: 'dispatcher',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000009',
    full_name: 'Dr. Sunita Rao (Trauma Chief)',
    phone: '+919876543218',
    email: 'hospital@example.com',
    password_hash: defaultSeedPasswordHash,
    role: 'hospital_admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000010',
    full_name: 'Dr. Ramesh Kumar (Platform Admin)',
    phone: '+919876543219',
    email: 'admin@example.com',
    password_hash: defaultSeedPasswordHash,
    role: 'system_admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  // ResQGrid domain accounts
  {
    id: 'a0000000-0000-0000-0000-000000000011',
    full_name: 'Rahul Sharma (Citizen)',
    phone: '+919876543220',
    email: 'citizen@resqgrid.org',
    password_hash: defaultSeedPasswordHash,
    role: 'citizen',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000012',
    full_name: 'Paramedic Officer Raj',
    phone: '+919876543221',
    email: 'driver@resqgrid.org',
    password_hash: defaultSeedPasswordHash,
    role: 'ambulance_driver',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000013',
    full_name: 'Chief Dispatcher Sarah Jenkins',
    phone: '+919876543222',
    email: 'dispatcher@resqgrid.org',
    password_hash: defaultSeedPasswordHash,
    role: 'dispatcher',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000014',
    full_name: 'Dr. Ramesh Rao (Trauma Chief)',
    phone: '+919876543223',
    email: 'hospital@resqgrid.org',
    password_hash: defaultSeedPasswordHash,
    role: 'hospital_admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000015',
    full_name: 'Platform Operations Admin',
    phone: '+919876543224',
    email: 'admin@resqgrid.org',
    password_hash: defaultSeedPasswordHash,
    role: 'system_admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

for (const user of initialSeedUsers) {
  fallbackUsers.set(user.email.toLowerCase(), user);
}

export class AuthRepository {
  async findByEmail(email: string): Promise<UserProfileRecord | null> {
    const normalizedEmail = email.toLowerCase().trim();

    if (pool && isPostgresConnected) {
      try {
        const res = await query<UserProfileRecord>(
          'SELECT * FROM profiles WHERE LOWER(email) = $1 LIMIT 1',
          [normalizedEmail]
        );
        return res.rows[0] || null;
      } catch {
        // Fallback to local store
      }
    }

    return fallbackUsers.get(normalizedEmail) || null;
  }

  async findById(id: string): Promise<UserProfileRecord | null> {
    if (pool && isPostgresConnected) {
      try {
        const res = await query<UserProfileRecord>(
          'SELECT * FROM profiles WHERE id = $1 LIMIT 1',
          [id]
        );
        return res.rows[0] || null;
      } catch {
        // Fallback to local store
      }
    }

    for (const user of fallbackUsers.values()) {
      if (user.id === id) return user;
    }
    return null;
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

    if (pool && isPostgresConnected) {
      try {
        const res = await query<UserProfileRecord>(
          `INSERT INTO profiles (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, true, $7, $7)
           RETURNING *`,
          [id, data.fullName, normalizedEmail, data.phone || null, data.passwordHash, data.role, now]
        );
        const record = res.rows[0];
        if (record) {
          fallbackUsers.set(normalizedEmail, record);
          return record;
        }
      } catch {
        // Continue to fallback
      }
    }

    const newRecord: UserProfileRecord = {
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

    fallbackUsers.set(normalizedEmail, newRecord);
    return newRecord;
  }

  async updateProfile(id: string, data: { fullName?: string; phone?: string }): Promise<UserProfileRecord | null> {
    const user = await this.findById(id);
    if (!user) return null;

    const updated: UserProfileRecord = {
      ...user,
      full_name: data.fullName ?? user.full_name,
      phone: data.phone ?? user.phone,
      updated_at: new Date(),
    };

    if (pool && isPostgresConnected) {
      try {
        await query(
          'UPDATE profiles SET full_name = $1, phone = $2, updated_at = NOW() WHERE id = $3',
          [updated.full_name, updated.phone, id]
        );
      } catch {
        // Ignore in fallback
      }
    }

    fallbackUsers.set(updated.email.toLowerCase(), updated);
    return updated;
  }

  async count(): Promise<number> {
    if (pool && isPostgresConnected) {
      try {
        const res = await query<{ count: string }>('SELECT COUNT(*) as count FROM profiles');
        return parseInt(res.rows[0]?.count || '0', 10);
      } catch {
        // Continue to fallback
      }
    }
    return fallbackUsers.size;
  }
}

export const authRepository = new AuthRepository();
