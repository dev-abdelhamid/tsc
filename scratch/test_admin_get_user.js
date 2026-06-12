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
      const res = await fetch(`${baseUrl}/admin/users/17`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar'
        }
      });
      console.log(`GET /admin/users/17 | Status: ${res.status}`);
      if (res.status === 200) {
        const d = await res.json();
        console.log('User 17:', JSON.stringify(d.data || d, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  }
}

run();
