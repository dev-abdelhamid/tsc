const token = '377|KvfeDcvkAWuRP0kOFctWYBe7atYyaHWAyzk06VEtaeffbb8a';
const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/portfolio`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Accept-Language': 'ar'
      }
    });
    
    console.log('Portfolio status:', res.status);
    const data = await res.json();
    console.log('Portfolio data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
