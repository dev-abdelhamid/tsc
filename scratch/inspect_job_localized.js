const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/public/jobs?locale=ar`);
    const data = await res.json();
    const jobs = data.data || data;
    if (jobs && jobs.length > 0) {
      console.log('=== PUBLIC JOB WITH ?locale=ar ===');
      console.log('Category value:', jobs[0].category);
      console.log('SubCategory value:', jobs[0].subCategory);
    }
  } catch (err) {
    console.error(err);
  }
}

run();
