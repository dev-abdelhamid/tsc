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
      // 1. Try fetching GET /users/17
      const res1 = await fetch(`${baseUrl}/users/17`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar'
        }
      });
      console.log(`GET /users/17 | Status: ${res1.status}`);
      if (res1.status === 200) {
        const d = await res1.json();
        console.log('User 17:', d.data?.name || d.name);
      }

      // 2. Try fetching GET /portfolio/17 or similar?
      const res2 = await fetch(`${baseUrl}/portfolio/17`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar'
        }
      });
      console.log(`GET /portfolio/17 | Status: ${res2.status}`);

      // 3. Try fetching GET /company/applications/6 (single application detail)
      const res3 = await fetch(`${baseUrl}/company/applications/6`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar'
        }
      });
      console.log(`GET /company/applications/6 | Status: ${res3.status}`);
      if (res3.status === 200) {
        const d = await res3.json();
        console.log('App 6 keys:', Object.keys(d.data || d));
      }
    }
  } catch (err) {
    console.error(err);
  }
}

run();
