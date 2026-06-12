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
      // Test different URL paths to see what is returned
      const urls = [
        '/users?filter[roles.name]=User&page=1&per_page=5',
        '/users?filter[roles.name]=Company&page=1&per_page=5',
        '/users?filter[role]=User&page=1&per_page=5',
        '/users?filter[role]=Company&page=1&per_page=5',
        '/users?filter[role_name]=User&page=1&per_page=5',
      ];

      for (const path of urls) {
        const res = await fetch(`${baseUrl}${path}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Accept-Language': 'ar'
          }
        });
        console.log(`Path: ${path} | Status: ${res.status}`);
        const data = await res.json();
        console.log(`Response length:`, data.data ? data.data.length : 'no data');
        if (data.data && data.data.length > 0) {
          console.log(`First user roles:`, data.data[0].roles || data.data[0].role);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

run();
