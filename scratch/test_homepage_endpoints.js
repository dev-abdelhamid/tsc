const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function testEndpoint(path) {
  const start = Date.now();
  console.log(`[REQ] GET ${path}`);
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { 'Accept': 'application/json', 'Accept-Language': 'ar' }
    });
    const duration = Date.now() - start;
    console.log(`[RES] GET ${path} | Status: ${res.status} | Time: ${duration}ms`);
    const data = await res.json();
    console.log(`[DATA] keys:`, Object.keys(data));
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[ERR] GET ${path} | Time: ${duration}ms | Error:`, err.message);
  }
}

async function run() {
  await testEndpoint('/public/home');
  await testEndpoint('/home');
  await testEndpoint('/settings');
}

run();
