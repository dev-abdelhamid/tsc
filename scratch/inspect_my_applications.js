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

    // Get applications list
    const getRes = await fetch(`${baseUrl}/my-applications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Accept-Language': 'ar'
      }
    });
    const appsData = await getRes.json();
    console.log('--- List My Applications Response: ---');
    console.log(JSON.stringify(appsData, null, 2));

  } catch (err) {
    console.error(err);
  }
}

run();
