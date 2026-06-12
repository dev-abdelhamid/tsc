const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  try {
    const formData = new FormData();
    formData.append('email', 'test3@example.com');
    formData.append('password', 'Fcis_it4');

    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Accept-Language': 'ar', 'Accept': 'application/json' },
      body: formData
    });

    const loginData = await loginRes.json();
    const token = loginData.data?.tokens?.access_token || loginData.data?.accessToken || loginData.data?.token || loginData.accessToken;
    console.log('Token:', token ? 'obtained' : 'FAILED');

    if (token) {
      // Fetch GET /company/applications without job_id
      const res = await fetch(`${baseUrl}/company/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar'
        }
      });
      console.log(`GET /company/applications | Status: ${res.status}`);
      const data = await res.json();
      console.log(`Response keys:`, Object.keys(data));
      if (data.data) {
        console.log(`Applications length:`, data.data.length);
        if (data.data.length > 0) {
          console.log(`First application:`, JSON.stringify(data.data[0]).slice(0, 500));
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

run();
