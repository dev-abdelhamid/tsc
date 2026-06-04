const token = '377|KvfeDcvkAWuRP0kOFctWYBe7atYyaHWAyzk06VEtaeffbb8a';
const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  try {
    const jobsRes = await fetch(`${baseUrl}/jobs?page=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Accept-Language': 'ar'
      }
    });
    
    const jobsData = await jobsRes.json();
    const jobs = jobsData.data || jobsData;
    console.log('Total jobs found:', Array.isArray(jobs) ? jobs.length : 'not an array');
    
    if (Array.isArray(jobs)) {
      for (const job of jobs) {
        console.log(`Checking Job ID ${job.id}: (applications_count: ${job.applications_count})...`);
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
    } else {
      console.log('Jobs response body:', jobsData);
    }
  } catch (err) {
    console.error(err);
  }
}

run();
