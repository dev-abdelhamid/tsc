const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/public/jobs`);
    const data = await res.json();
    const jobs = data.data || data;
    if (jobs && jobs.length > 0) {
      console.log('=== FIRST PUBLIC JOB COMPLETE OBJECT ===');
      console.log(JSON.stringify(jobs[0], null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}

run();
