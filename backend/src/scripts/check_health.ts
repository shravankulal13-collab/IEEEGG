import { checkDatabaseHealth, query } from '../config/database.js';

async function main() {
  console.log('--- Probing Database Health ---');
  const health = await checkDatabaseHealth();
  console.log('Health Result:', health);

  console.log('\n--- Querying Hospitals from Supabase ---');
  const hosps = await query('SELECT * FROM hospitals ORDER BY name ASC');
  console.log(`Fetched ${hosps.rows.length} hospitals:`);
  hosps.rows.forEach((h: any) => {
    console.log(` - ${h.name} (${h.address}), Available Beds: ${h.available_beds}`);
  });

  console.log('\n--- Querying Ambulances from Supabase ---');
  const ambs = await query('SELECT * FROM ambulances ORDER BY created_at DESC');
  console.log(`Fetched ${ambs.rows.length} ambulances:`);
  ambs.rows.forEach((a: any) => {
    console.log(` - ${a.ambulance_number} (${a.ambulance_type}), Status: ${a.status}`);
  });

  console.log('\n--- Querying Incidents from Supabase ---');
  const incs = await query('SELECT * FROM incidents ORDER BY reported_at DESC');
  console.log(`Fetched ${incs.rows.length} incidents:`);
  incs.rows.forEach((i: any) => {
    console.log(` - [${i.id}] ${i.title || i.emergency_type} (Severity: ${i.severity})`);
  });
}

main().catch(console.error);
