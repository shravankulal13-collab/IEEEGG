import { checkDatabaseHealth } from '../config/database.js';

async function testEndpoints() {
  console.log('Testing /api/health directly...');
  const health = await checkDatabaseHealth();
  console.log('Health check passed:', health);

  console.log('Testing HTTP requests to local backend server at port 5000...');
  try {
    const healthRes = await fetch('http://localhost:5000/api/health');
    console.log('/api/health HTTP Status:', healthRes.status, await healthRes.json());

    const hospRes = await fetch('http://localhost:5000/api/hospitals');
    console.log('/api/hospitals HTTP Status:', hospRes.status);
    const hospData = await hospRes.json();
    console.log('Hospitals Count:', hospData.data?.length, 'First hospital:', hospData.data?.[0]?.name);

    const ambRes = await fetch('http://localhost:5000/api/ambulances');
    console.log('/api/ambulances HTTP Status:', ambRes.status);
    const ambData = await ambRes.json();
    console.log('Ambulances Count:', ambData.data?.length, 'First ambulance:', ambData.data?.[0]?.ambulance_number);
  } catch (err: any) {
    console.log('HTTP request note:', err.message);
  }
}

testEndpoints().catch(console.error);
