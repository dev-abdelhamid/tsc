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
    console.log('Token:', token ? 'obtained' : 'FAILED');

    if (token) {
      const res = await fetch(`${baseUrl}/users?filter[roles.name]=Admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar'
        }
      });
      console.log('Admin check status:', res.status);
      const data = await res.json();
      console.log('Admin total:', data.meta?.total, 'length:', data.data?.length);
      if (data.data && data.data.length > 0) {
        console.log('Admin roles:', data.data[0].roles);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

run();
