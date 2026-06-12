async function run() {
  const start = Date.now();
  console.log('[REQ] GET http://localhost:3000/ar (waiting up to 90s)...');
  try {
    const res = await fetch('http://localhost:3000/ar', {
      headers: { 'Accept': 'text/html', 'Accept-Language': 'ar' },
      signal: AbortSignal.timeout(90000) // 90 seconds timeout
    });
    const duration = Date.now() - start;
    console.log(`[RES] Status: ${res.status} | Time: ${duration}ms`);
    console.log('[HEADERS]:', Object.fromEntries(res.headers.entries()));
    const body = await res.text();
    console.log(`[BODY] Length: ${body.length}`);
    console.log(`[BODY] Preview:`, body.slice(0, 500));
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[ERR] Time: ${duration}ms | Error:`, err.message);
  }
}

run();
