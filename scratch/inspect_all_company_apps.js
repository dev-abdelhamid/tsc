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
      console.log('ALL_APPLICATIONS_START');
      console.log(JSON.stringify(data.data || data, null, 2));
      console.log('ALL_APPLICATIONS_END');
    }
  } catch (err) {
    console.error(err);
  }
}

run();
