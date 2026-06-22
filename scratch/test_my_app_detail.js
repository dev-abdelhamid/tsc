const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  try {
    const formData = new FormData();
    formData.append('email', 'test44@example.com');
    formData.append('password', 'Fcis_it4');

    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Accept-Language': 'ar', 'Accept': 'application/json' },
      body: formData
    });

    const loginData = await loginRes.json();
    const token = loginData.data?.tokens?.access_token || loginData.data?.accessToken || loginData.data?.token || loginData.accessToken;
    console.log('Token obtained:', !!token);
    if (!token) return;

    const res = await fetch(`${baseUrl}/my-applications/6`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Accept-Language': 'ar'
      }
    });
    const status = res.status;
    const body = await res.json();
    console.log(`Fetch Status: ${status}`);
    console.log('Message:', body.message);
    console.log('Exception:', body.exception);
    if (body.errors) console.log('Errors:', body.errors);

  } catch (err) {
    console.error(err);
  }
}

run();
