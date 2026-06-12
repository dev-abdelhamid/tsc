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
      const id = 2; // adham
      const res = await fetch(`${baseUrl}/users/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar'
        }
      });
      console.log(`POST /users/${id} | Status: ${res.status}`);
      const data = await res.json();
      console.log(`Response keys:`, Object.keys(data));
      if (data.data) {
        console.log(`User name:`, data.data.name, `role:`, data.data.roles || data.data.role);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

run();
