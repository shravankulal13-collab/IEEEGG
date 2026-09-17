// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Database Schema Migration Runner
// ============================================================

import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL is not defined in .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  console.log('--- Starting Supabase PostgreSQL Database Migration ---');
  const client = await pool.connect();

  try {
    // 1. Read schema.sql from database directory
    const schemaPath = path.resolve(process.cwd(), '../database/schema.sql');
    let schemaSql = '';
    if (fs.existsSync(schemaPath)) {
      schemaSql = fs.readFileSync(schemaPath, 'utf8');
      console.log(`Loaded schema.sql (${schemaSql.length} bytes)`);
    } else {
      console.warn(`schema.sql not found at ${schemaPath}, checking alternative path...`);
      const altPath = path.resolve(process.cwd(), 'schema.sql');
      if (fs.existsSync(altPath)) {
        schemaSql = fs.readFileSync(altPath, 'utf8');
      }
    }

    if (schemaSql) {
      // Strip UTF-8 BOM if present
      schemaSql = schemaSql.replace(/^\uFEFF/, '').trim();
      // Replace CREATE TRIGGER with CREATE OR REPLACE TRIGGER for idempotency
      schemaSql = schemaSql.replace(/\bCREATE TRIGGER\b/gi, 'CREATE OR REPLACE TRIGGER');
      console.log('Executing schema.sql with idempotent triggers...');
      await client.query(schemaSql);
      console.log('✓ schema.sql executed successfully.');
    }

    const publicReportsPath = path.resolve(process.cwd(), '../database/migrations/002_public_incident_reports.sql');
    if (fs.existsSync(publicReportsPath)) {
      await client.query(fs.readFileSync(publicReportsPath, 'utf8').replace(/^\uFEFF/, '').trim());
      console.log('✓ public incident report tables verified.');
    }

    const healthPostsPath = path.resolve(process.cwd(), '../database/migrations/003_health_posts.sql');
    if (fs.existsSync(healthPostsPath)) {
      await client.query(fs.readFileSync(healthPostsPath, 'utf8').replace(/^\uFEFF/, '').trim());
      console.log('✓ health post tables verified.');
    }

    // 2. Ensure dispatch_logs table exists
    console.log('Ensuring dispatch_logs and compatibility structures exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS dispatch_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
        "assignedAmbulanceId" TEXT,
        "targetHospitalId" UUID REFERENCES hospitals(id) ON DELETE SET NULL,
        status TEXT NOT NULL DEFAULT 'PENDING_ACCEPTANCE',
        severity TEXT,
        "requiresICU" BOOLEAN DEFAULT FALSE,
        "requiredEquipment" TEXT[] DEFAULT '{}',
        "requiredSpecialists" TEXT[] DEFAULT '{}',
        location JSONB,
        bed_held BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✓ dispatch_logs table verified.');

    // 3. Ensure compatibility columns on hospitals
    await client.query(`
      ALTER TABLE hospitals 
        ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS "availableEmergencyBeds" INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "availableICUBeds" INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "onCallSpecialists" JSONB DEFAULT '[]'::JSONB;
    `);
    console.log('✓ hospital compatibility columns verified.');

    // 4. Ensure compatibility columns on ambulances
    await client.query(`
      ALTER TABLE ambulances
        ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
    `);
    console.log('✓ ambulance compatibility columns verified.');

    // 5. Verify all tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n--- Tables in public schema ---');
    res.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.table_name}`);
    });

    console.log('\n=== Database Migration Completed Successfully! ===');
  } catch (err: any) {
    console.error('Migration failed with error:', err.message);
    console.error('Details:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
