const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/public/jobs/20`, {
      headers: { 'Accept-Language': 'ar' }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
