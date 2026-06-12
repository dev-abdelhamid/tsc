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
      // Fetch some job applications first to get an application ID
      const appsRes = await fetch(`${baseUrl}/admin/job-applications?page=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar'
        }
      });
      const appsData = await appsRes.json();
      const rawList = appsData.data || [];
      console.log('Total applications found on page 1:', rawList.length);
      if (rawList.length > 0) {
        const appId = rawList[0].id || rawList[0].applicationId;
        console.log('First application ID:', appId);
        
        // Now fetch that application directly by ID
        const appRes = await fetch(`${baseUrl}/admin/job-applications/${appId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Accept-Language': 'ar'
          }
        });
        console.log(`GET /admin/job-applications/${appId} | Status: ${resStatus = appRes.status}`);
        const appData = await appRes.json();
        console.log(`Response keys:`, Object.keys(appData));
        if (appData.data) {
          console.log(`App details:`, JSON.stringify(appData.data).slice(0, 500));
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

run();
