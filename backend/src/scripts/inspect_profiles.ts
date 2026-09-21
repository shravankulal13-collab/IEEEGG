
import { env } from '../config/env.js';

async function checkProfiles() {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY;
  const headers = { apikey: key, Authorization: 'Bearer ' + key };
  const resp = await fetch(`${url}/profiles?select=*`, { headers });
  const profiles = await resp.json();
  console.log('Found', profiles.length, 'profiles:');
  for (const p of profiles) {
    console.log(`- ${p.email} | role: ${p.role} | hash: ${p.password_hash?.substring(0, 15)}...`);
  }
}

checkProfiles().catch(console.error);
