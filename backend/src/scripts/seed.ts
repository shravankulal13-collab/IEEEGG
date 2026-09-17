// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Supabase PostgreSQL Database Seeder
// ============================================================

import path from 'path';
import pg from 'pg';
import bcrypt from 'bcryptjs';
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

async function runSeed() {
  console.log('--- Starting Supabase Database Seeding (Real Bengaluru Operations) ---');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 0. Ensure password_hash column and relax Supabase auth.users FK for direct Postgres auth
    await client.query(`
      ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
      ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
    `);

    // 1. Seed User Profiles
    console.log('Seeding profiles...');
    const defaultPasswordHash = bcrypt.hashSync('Emergency123!', 10);

    const users = [
      {
        id: 'a0000000-0000-0000-0000-000000000001',
        full_name: 'Dr. Ramesh Kumar (Director)',
        email: 'admin@emergency.gov.in',
        phone: '+919880123456',
        role: 'system_admin',
      },
      {
        id: 'a0000000-0000-0000-0000-000000000002',
        full_name: 'Vikram Mehta (Chief Dispatcher)',
        email: 'dispatcher@emergency.gov.in',
        phone: '+919880123457',
        role: 'dispatcher',
      },
      {
        id: 'a0000000-0000-0000-0000-000000000003',
        full_name: 'Manjunath Gowda (Senior EMS Pilot)',
        email: 'driver@emergency.gov.in',
        phone: '+919880123458',
        role: 'ambulance_driver',
      },
      {
        id: 'a0000000-0000-0000-0000-000000000004',
        full_name: 'Sunita Rao (Hospital Admin)',
        email: 'hospital@emergency.gov.in',
        phone: '+919880123459',
        role: 'hospital_admin',
      },
      {
        id: 'a0000000-0000-0000-0000-000000000005',
        full_name: 'Pavana Murthy (Citizen)',
        email: 'citizen@emergency.gov.in',
        phone: '+919880123460',
        role: 'citizen',
      },
      // Convenience aliases for quick testing
      {
        id: 'a0000000-0000-0000-0000-000000000006',
        full_name: 'Pavana Murthy',
        email: 'citizen@example.com',
        phone: '+919880123460',
        role: 'citizen',
      },
      {
        id: 'a0000000-0000-0000-0000-000000000007',
        full_name: 'Manjunath Gowda',
        email: 'driver@example.com',
        phone: '+919880123458',
        role: 'ambulance_driver',
      },
      {
        id: 'a0000000-0000-0000-0000-000000000008',
        full_name: 'Vikram Mehta',
        email: 'dispatcher@example.com',
        phone: '+919880123457',
        role: 'dispatcher',
      },
      {
        id: 'a0000000-0000-0000-0000-000000000009',
        full_name: 'Sunita Rao',
        email: 'hospital@example.com',
        phone: '+919880123459',
        role: 'hospital_admin',
      },
      {
        id: 'a0000000-0000-0000-0000-000000000010',
        full_name: 'Dr. Ramesh Kumar',
        email: 'admin@example.com',
        phone: '+919880123456',
        role: 'system_admin',
      },
    ];

    for (const u of users) {
      await client.query(`
        INSERT INTO profiles (id, full_name, email, phone, role, password_hash, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          role = EXCLUDED.role,
          password_hash = EXCLUDED.password_hash,
          is_active = true,
          updated_at = NOW();
      `, [u.id, u.full_name, u.email, u.phone, u.role, defaultPasswordHash]);
    }
    console.log(`✓ Seeded ${users.length} user profiles.`);

    // 2. Seed Real Bengaluru Trauma Centers & Hospitals
    console.log('Seeding hospitals...');
    const hospitals = [
      {
        id: 'b0000000-0000-0000-0000-000000000001',
        name: 'Apollo Hospital Bannerghatta',
        registration_number: 'KA-BLR-HOSP-001',
        phone: '+918026304050',
        emergency_phone: '+918026304055',
        address: '154/11, Opp. IIMB, Bannerghatta Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        latitude: 12.8953,
        longitude: 77.5986,
        status: 'active',
        emergency_department: true,
        trauma_center: true,
        icu_available: true,
        ambulance_receiving: true,
        total_beds: 350,
        available_beds: 42,
        total_icu_beds: 45,
        available_icu_beds: 8,
        total_doctors: 65,
        available_doctors: 18,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000002',
        name: 'Fortis Hospital Cunningham Road',
        registration_number: 'KA-BLR-HOSP-002',
        phone: '+918041994444',
        emergency_phone: '+918041994455',
        address: '14, Cunningham Road, Vasanth Nagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        latitude: 12.9882,
        longitude: 77.5978,
        status: 'active',
        emergency_department: true,
        trauma_center: true,
        icu_available: true,
        ambulance_receiving: true,
        total_beds: 220,
        available_beds: 28,
        total_icu_beds: 30,
        available_icu_beds: 5,
        total_doctors: 45,
        available_doctors: 12,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000003',
        name: 'Manipal Hospital Old Airport Road',
        registration_number: 'KA-BLR-HOSP-003',
        phone: '+918025024444',
        emergency_phone: '+918025024455',
        address: '98, HAL Old Airport Road, Kodihalli',
        city: 'Bengaluru',
        state: 'Karnataka',
        latitude: 12.9592,
        longitude: 77.6534,
        status: 'active',
        emergency_department: true,
        trauma_center: true,
        icu_available: true,
        ambulance_receiving: true,
        total_beds: 400,
        available_beds: 55,
        total_icu_beds: 60,
        available_icu_beds: 11,
        total_doctors: 85,
        available_doctors: 24,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000004',
        name: 'Victoria Hospital (BMCRI Trauma Care)',
        registration_number: 'KA-BLR-HOSP-004',
        phone: '+918026701150',
        emergency_phone: '+918026701155',
        address: 'Fort Road, Near City Market, Kalasipalya',
        city: 'Bengaluru',
        state: 'Karnataka',
        latitude: 12.9634,
        longitude: 77.5746,
        status: 'active',
        emergency_department: true,
        trauma_center: true,
        icu_available: true,
        ambulance_receiving: true,
        total_beds: 600,
        available_beds: 85,
        total_icu_beds: 50,
        available_icu_beds: 14,
        total_doctors: 110,
        available_doctors: 32,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000005',
        name: 'St. Johns Medical College Hospital',
        registration_number: 'KA-BLR-HOSP-005',
        phone: '+918022065000',
        emergency_phone: '+918022065055',
        address: 'Sarjapur Road, John Nagar, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        latitude: 12.9344,
        longitude: 77.6208,
        status: 'active',
        emergency_department: true,
        trauma_center: true,
        icu_available: true,
        ambulance_receiving: true,
        total_beds: 480,
        available_beds: 60,
        total_icu_beds: 40,
        available_icu_beds: 7,
        total_doctors: 90,
        available_doctors: 22,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000006',
        name: 'Narayana Health City (Mazumdar Shaw)',
        registration_number: 'KA-BLR-HOSP-006',
        phone: '+918071222222',
        emergency_phone: '+918071222255',
        address: '258/A, Bommasandra Industrial Area, Anekal Taluk',
        city: 'Bengaluru',
        state: 'Karnataka',
        latitude: 12.8122,
        longitude: 77.6934,
        status: 'active',
        emergency_department: true,
        trauma_center: true,
        icu_available: true,
        ambulance_receiving: true,
        total_beds: 500,
        available_beds: 72,
        total_icu_beds: 55,
        available_icu_beds: 12,
        total_doctors: 95,
        available_doctors: 26,
      },
    ];

    for (const h of hospitals) {
      await client.query(`
        INSERT INTO hospitals (
          id, name, registration_number, phone, emergency_phone, address, city, state,
          latitude, longitude, status, emergency_department, trauma_center, icu_available,
          ambulance_receiving, total_beds, available_beds, total_icu_beds, available_icu_beds,
          total_doctors, available_doctors, active, "availableEmergencyBeds", "availableICUBeds",
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19,
          $20, $21, true, $17, $19,
          NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          registration_number = EXCLUDED.registration_number,
          phone = EXCLUDED.phone,
          emergency_phone = EXCLUDED.emergency_phone,
          address = EXCLUDED.address,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          status = EXCLUDED.status,
          emergency_department = EXCLUDED.emergency_department,
          trauma_center = EXCLUDED.trauma_center,
          icu_available = EXCLUDED.icu_available,
          ambulance_receiving = EXCLUDED.ambulance_receiving,
          total_beds = EXCLUDED.total_beds,
          available_beds = EXCLUDED.available_beds,
          total_icu_beds = EXCLUDED.total_icu_beds,
          available_icu_beds = EXCLUDED.available_icu_beds,
          total_doctors = EXCLUDED.total_doctors,
          available_doctors = EXCLUDED.available_doctors,
          active = true,
          "availableEmergencyBeds" = EXCLUDED.available_beds,
          "availableICUBeds" = EXCLUDED.available_icu_beds,
          updated_at = NOW();
      `, [
        h.id, h.name, h.registration_number, h.phone, h.emergency_phone, h.address, h.city, h.state,
        h.latitude, h.longitude, h.status, h.emergency_department, h.trauma_center, h.icu_available,
        h.ambulance_receiving, h.total_beds, h.available_beds, h.total_icu_beds, h.available_icu_beds,
        h.total_doctors, h.available_doctors,
      ]);
    }
    console.log(`✓ Seeded ${hospitals.length} hospitals.`);

    // 3. Seed Hospital Doctors
    console.log('Seeding hospital doctors...');
    const doctors = [
      // Apollo Bannerghatta
      { hospital_id: hospitals[0].id, name: 'Dr. Rajesh Sharma', specialization: 'Trauma & Emergency Surgery', department: 'Emergency Medicine', phone: '+919845011221', on_duty: true, available: true },
      { hospital_id: hospitals[0].id, name: 'Dr. Ananya Iyer', specialization: 'Interventional Cardiology', department: 'Cardiology', phone: '+919845011222', on_duty: true, available: true },
      { hospital_id: hospitals[0].id, name: 'Dr. Suresh Reddy', specialization: 'Critical Care Medicine', department: 'ICU', phone: '+919845011223', on_duty: true, available: false },
      
      // Fortis Cunningham Rd
      { hospital_id: hospitals[1].id, name: 'Dr. Priya Nair', specialization: 'Neurosurgery & Stroke Care', department: 'Neuro Sciences', phone: '+919845022331', on_duty: true, available: true },
      { hospital_id: hospitals[1].id, name: 'Dr. Karthik Hegde', specialization: 'Emergency Resuscitation', department: 'Trauma Care', phone: '+919845022332', on_duty: true, available: true },
      
      // Manipal HAL Airport Rd
      { hospital_id: hospitals[2].id, name: 'Dr. Meera Nambiar', specialization: 'Cardiothoracic Surgery', department: 'Cardiac Sciences', phone: '+919845033441', on_duty: true, available: true },
      { hospital_id: hospitals[2].id, name: 'Dr. Arvind Swamy', specialization: 'Pediatric Emergency Medicine', department: 'Pediatrics', phone: '+919845033442', on_duty: true, available: true },
      
      // Victoria Hospital
      { hospital_id: hospitals[3].id, name: 'Dr. B. R. Chandrashekar', specialization: 'Mass Casualty & Burn Care', department: 'Trauma & Burns', phone: '+919845044551', on_duty: true, available: true },
      { hospital_id: hospitals[3].id, name: 'Dr. Shwetha Patil', specialization: 'Orthopedic Trauma Surgery', department: 'Orthopedics', phone: '+919845044552', on_duty: true, available: true },

      // St. Johns
      { hospital_id: hospitals[4].id, name: 'Dr. George Mathew', specialization: 'Emergency Medicine', department: 'Casualty', phone: '+919845055661', on_duty: true, available: true },
      { hospital_id: hospitals[4].id, name: 'Dr. Deepa Thomas', specialization: 'Intensive Care Specialist', department: 'MICU', phone: '+919845055662', on_duty: true, available: true },

      // Narayana Health City
      { hospital_id: hospitals[5].id, name: 'Dr. Devi Prasad Shetty (Consultant)', specialization: 'Cardiac Surgery', department: 'Cardiac Sciences', phone: '+919845066771', on_duty: true, available: true },
      { hospital_id: hospitals[5].id, name: 'Dr. Harish Kumar', specialization: 'Vascular & Trauma Surgery', department: 'Emergency Care', phone: '+919845066772', on_duty: true, available: true },
    ];

    // Clear existing doctors to avoid duplicates on re-seed
    await client.query('DELETE FROM hospital_doctors;');
    for (const d of doctors) {
      await client.query(`
        INSERT INTO hospital_doctors (
          id, hospital_id, name, specialization, department, phone, available, on_duty, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
        );
      `, [d.hospital_id, d.name, d.specialization, d.department, d.phone, d.available, d.on_duty]);
    }
    console.log(`✓ Seeded ${doctors.length} hospital doctors.`);

    // 4. Seed Hospital Resources & Beds
    console.log('Seeding hospital resources & beds...');
    await client.query('DELETE FROM hospital_resources;');
    for (const h of hospitals) {
      const resources = [
        { type: 'Ventilators', total: 20, available: Math.min(20, Math.max(0, Math.floor(h.available_icu_beds * 0.8))) },
        { type: 'Oxygen Concentrators', total: 100, available: Math.min(100, Math.max(0, Math.floor(h.available_beds * 0.6))) },
        { type: 'Cath Labs', total: 4, available: 2 },
        { type: 'Trauma Resuscitation Bays', total: 6, available: 3 },
      ];

      for (const r of resources) {
        await client.query(`
          INSERT INTO hospital_resources (
            id, hospital_id, resource_type, total_quantity, available_quantity, status, last_updated_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, 'available', NOW()
          ) ON CONFLICT (hospital_id, resource_type) DO UPDATE SET
            total_quantity = EXCLUDED.total_quantity,
            available_quantity = EXCLUDED.available_quantity,
            last_updated_at = NOW();
        `, [h.id, r.type, r.total, r.available]);
      }
    }
    console.log('✓ Seeded hospital resources.');

    // 5. Seed Real Ambulances with Live Bengaluru Coordinates
    console.log('Seeding ambulances...');
    const ambulances = [
      {
        id: 'c0000000-0000-0000-0000-000000000001',
        ambulance_number: 'KA-01-EA-1042',
        registration_number: 'KA-01-EA-1042',
        organization_name: 'ResQGrid Central Fleet',
        driver_id: 'a0000000-0000-0000-0000-000000000003',
        status: 'available' as const,
        emergency_capable: true,
        ambulance_type: 'ALS (Advanced Life Support)',
        current_latitude: 12.9716,
        current_longitude: 77.5946,
        current_speed_kmh: 0,
        current_heading: 90,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000002',
        ambulance_number: 'KA-05-EA-4820',
        registration_number: 'KA-05-EA-4820',
        organization_name: 'Apollo Trauma Response',
        driver_id: null,
        status: 'available' as const,
        emergency_capable: true,
        ambulance_type: 'ALS (Advanced Life Support)',
        current_latitude: 12.9340,
        current_longitude: 77.6100,
        current_speed_kmh: 0,
        current_heading: 180,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000003',
        ambulance_number: 'KA-04-EA-9110',
        registration_number: 'KA-04-EA-9110',
        organization_name: 'Fortis Rapid Squad',
        driver_id: null,
        status: 'available' as const,
        emergency_capable: true,
        ambulance_type: 'BLS (Basic Life Support)',
        current_latitude: 12.9900,
        current_longitude: 77.5800,
        current_speed_kmh: 0,
        current_heading: 0,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000004',
        ambulance_number: 'KA-03-EA-3321',
        registration_number: 'KA-03-EA-3321',
        organization_name: 'Manipal Mobile ICU',
        driver_id: null,
        status: 'available' as const,
        emergency_capable: true,
        ambulance_type: 'MICU (Mobile Intensive Care Unit)',
        current_latitude: 12.9550,
        current_longitude: 77.6400,
        current_speed_kmh: 0,
        current_heading: 270,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000005',
        ambulance_number: 'KA-51-EA-7788',
        registration_number: 'KA-51-EA-7788',
        organization_name: 'Narayana Cardiac Express',
        driver_id: null,
        status: 'available' as const,
        emergency_capable: true,
        ambulance_type: 'ALS (Advanced Life Support)',
        current_latitude: 12.8900,
        current_longitude: 77.6000,
        current_speed_kmh: 0,
        current_heading: 45,
      },
      {
        id: 'c0000000-0000-0000-0000-000000000006',
        ambulance_number: 'KA-02-EA-5566',
        registration_number: 'KA-02-EA-5566',
        organization_name: 'Victoria City Rescue',
        driver_id: null,
        status: 'available' as const,
        emergency_capable: true,
        ambulance_type: 'BLS (Basic Life Support)',
        current_latitude: 12.9600,
        current_longitude: 77.5700,
        current_speed_kmh: 0,
        current_heading: 135,
      },
    ];

    for (const a of ambulances) {
      await client.query(`
        INSERT INTO ambulances (
          id, ambulance_number, registration_number, organization_name, driver_id, status,
          emergency_capable, ambulance_type, current_latitude, current_longitude, current_speed_kmh,
          current_heading, active, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, true, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          ambulance_number = EXCLUDED.ambulance_number,
          registration_number = EXCLUDED.registration_number,
          organization_name = EXCLUDED.organization_name,
          driver_id = EXCLUDED.driver_id,
          status = EXCLUDED.status,
          emergency_capable = EXCLUDED.emergency_capable,
          ambulance_type = EXCLUDED.ambulance_type,
          current_latitude = EXCLUDED.current_latitude,
          current_longitude = EXCLUDED.current_longitude,
          current_speed_kmh = EXCLUDED.current_speed_kmh,
          current_heading = EXCLUDED.current_heading,
          active = true,
          updated_at = NOW();
      `, [
        a.id, a.ambulance_number, a.registration_number, a.organization_name, a.driver_id, a.status,
        a.emergency_capable, a.ambulance_type, a.current_latitude, a.current_longitude, a.current_speed_kmh,
        a.current_heading,
      ]);
    }
    console.log(`✓ Seeded ${ambulances.length} ambulances.`);

    // 6. Seed Real Bengaluru Incidents
    console.log('Seeding real emergency incidents...');
    const incidents = [
      {
        id: '6e136310-20ce-4074-b520-8283787de2eb',
        reported_by: 'a0000000-0000-0000-0000-000000000005',
        emergency_type: 'accident',
        title: 'Multi-Vehicle Highway Collision (SH 104A)',
        description: 'Two-car high-speed collision on SH 104A corridor. 2 critical casualties requiring immediate Level-1 trauma care and ICU stabilization.',
        status: 'dispatched',
        verification_status: 'verified',
        verification_score: 98,
        severity: 4,
        people_affected: 3,
        latitude: 12.9850,
        longitude: 77.5850,
        address: 'SH 104A, Near Hebbal Junction, Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
      },
      {
        id: '6e136310-20ce-4074-b520-8283787de2ec',
        reported_by: 'a0000000-0000-0000-0000-000000000005',
        emergency_type: 'medical',
        title: 'Severe Cardiac Arrest with Respiratory Failure',
        description: 'Elderly patient collapsed near metro station. Immediate ALS resuscitation and cath lab transfer required.',
        status: 'en_route',
        verification_status: 'verified',
        verification_score: 95,
        severity: 5,
        people_affected: 1,
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'MG Road Metro Station North Concourse, Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
      },
      {
        id: '6e136310-20ce-4074-b520-8283787de2ed',
        reported_by: 'a0000000-0000-0000-0000-000000000005',
        emergency_type: 'fire',
        title: 'Commercial Facility Chemical Burn Injury',
        description: 'Industrial incident involving hot solvent exposure. Burn care and specialized plastic surgery resuscitation required.',
        status: 'reported',
        verification_status: 'pending',
        verification_score: 80,
        severity: 3,
        people_affected: 2,
        latitude: 12.9340,
        longitude: 77.6100,
        address: 'Koramangala 4th Block Industrial Corridor, Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
      },
    ];

    for (const inc of incidents) {
      await client.query(`
        INSERT INTO incidents (
          id, reported_by, emergency_type, title, description, status,
          verification_status, verification_score, severity, people_affected,
          latitude, longitude, location, address, city, state, reported_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3::emergency_type, $4, $5, $6::incident_status,
          $7::verification_status, $8, $9, $10,
          $11, $12, ST_SetSRID(ST_MakePoint($12, $11), 4326), $13, $14, $15, NOW(), NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          status = EXCLUDED.status,
          verification_status = EXCLUDED.verification_status,
          verification_score = EXCLUDED.verification_score,
          severity = EXCLUDED.severity,
          people_affected = EXCLUDED.people_affected,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          location = EXCLUDED.location,
          address = EXCLUDED.address,
          updated_at = NOW();
      `, [
        inc.id, inc.reported_by, inc.emergency_type, inc.title, inc.description, inc.status,
        inc.verification_status, inc.verification_score, inc.severity, inc.people_affected,
        inc.latitude, inc.longitude, inc.address, inc.city, inc.state,
      ]);
    }
    console.log(`✓ Seeded ${incidents.length} emergency incidents.`);

    // 7. Seed Corresponding Dispatch Logs
    console.log('Seeding dispatch logs...');
    const dispatches = [
      {
        incident_id: incidents[0].id,
        assignedAmbulanceId: ambulances[0].id,
        targetHospitalId: hospitals[0].id,
        status: 'ACCEPTED',
        severity: 'CRITICAL',
        requiresICU: true,
      },
      {
        incident_id: incidents[1].id,
        assignedAmbulanceId: ambulances[1].id,
        targetHospitalId: hospitals[1].id,
        status: 'EN_ROUTE',
        severity: 'CRITICAL',
        requiresICU: true,
      },
    ];

    for (const d of dispatches) {
      await client.query(`
        INSERT INTO dispatch_logs (
          id, incident_id, "assignedAmbulanceId", "targetHospitalId",
          status, severity, "requiresICU", created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW()
        );
      `, [d.incident_id, d.assignedAmbulanceId, d.targetHospitalId, d.status, d.severity, d.requiresICU]);
    }
    console.log(`✓ Seeded ${dispatches.length} dispatch logs.`);

    await client.query('COMMIT');
    console.log('\n=== Database Seeding Completed Successfully in Supabase PostgreSQL! ===');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
