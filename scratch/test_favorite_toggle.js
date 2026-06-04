const token = '377|KvfeDcvkAWuRP0kOFctWYBe7atYyaHWAyzk06VEtaeffbb8a';
const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/favourite-jobs/toggle`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'ar'
      },
      body: JSON.stringify({ job_id: 1 })
    });
    
    console.log('Toggle status:', res.status);
    const data = await res.json();
    console.log('Toggle response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
