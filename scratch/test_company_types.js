const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  const res = await fetch(`${baseUrl}/company-types`, {
    headers: { 'Accept-Language': 'ar', 'Accept': 'application/json' }
  });
  const data = await res.json();
  console.log('Company types:', JSON.stringify(data, null, 2));
}

run().catch(console.error);
