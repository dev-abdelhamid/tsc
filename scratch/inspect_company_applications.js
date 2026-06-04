const token = '372|OpppkoxbEuuTc7tCdJ9dMpJXPqxfLaZjXchmx4Pgad5f9943';
const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  try {
    const jobsRes = await fetch(`${baseUrl}/jobs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Accept-Language': 'ar'
      }
    });
    
    const jobsData = await jobsRes.json();
    const jobs = jobsData.data || jobsData;
    console.log('Total jobs found:', jobs.length);
    
    for (const job of jobs) {
      console.log(`Checking Job ID ${job.id}: ${JSON.stringify(job.title)} (applications_count: ${job.applications_count})...`);
      const appsRes = await fetch(`${baseUrl}/company/applications?job_id=${job.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar'
        }
      });
      const appsData = await appsRes.json();
      const apps = appsData.data || appsData;
      if (apps && apps.length > 0) {
        console.log(`Found ${apps.length} applications for Job ID ${job.id}!`);
        console.log('First Application:', JSON.stringify(apps[0], null, 2));
        break;
      }
    }
  } catch (err) {
    console.error(err);
  }
}

run();
