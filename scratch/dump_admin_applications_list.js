const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  try {
    const formData = new FormData();
    formData.append('email', 'admin@example.com');
    formData.append('password', 'password123');

    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Accept-Language': 'ar', 'Accept': 'application/json' },
      body: formData
    });

    const loginData = await loginRes.json();
    const token = loginData.data?.tokens?.access_token || loginData.data?.accessToken || loginData.data?.token || loginData.accessToken;
    
    if (token) {
      const res = await fetch(`${baseUrl}/admin/job-applications?page=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar'
        }
      });
      const data = await res.json();
      console.log('FULL_ADMIN_LIST_START');
      console.log(JSON.stringify(data.data?.[0] || data?.[0] || {}, null, 2));
      console.log('FULL_ADMIN_LIST_END');
    }
  } catch (err) {
    console.error(err);
  }
}

run();
