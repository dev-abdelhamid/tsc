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
    
    if (token) {
      const res = await fetch(`${baseUrl}/company/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar'
        }
      });
      const data = await res.json();
      console.log('FULL_FIRST_APPLICATION_START');
      console.log(JSON.stringify(data.data?.[0] || data?.[0] || {}, null, 2));
      console.log('FULL_FIRST_APPLICATION_END');
    }
  } catch (err) {
    console.error(err);
  }
}

run();
