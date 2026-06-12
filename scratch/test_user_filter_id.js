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
      const paths = [
        '/users?filter[id]=2',
        '/users?filter[email]=user@example.com',
        '/users?filter[name]=adham'
      ];
      for (const p of paths) {
        const res = await fetch(`${baseUrl}${p}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Accept-Language': 'ar'
          }
        });
        console.log(`Path: ${p} | Status: ${res.status}`);
        const data = await res.json();
        console.log(`Length:`, data.data ? data.data.length : 'no data');
        if (data.data && data.data.length > 0) {
          console.log(`First user ID:`, data.data[0].id, `name:`, data.data[0].name);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

run();
