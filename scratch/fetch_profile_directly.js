const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  console.log('Waiting 3 seconds to avoid rate limiting...');
  await new Promise(resolve => setTimeout(resolve, 3100));

  // Login
  const formData = new FormData();
  formData.append('email', 'takwa@mail.com');
  formData.append('password', 'takwa123');

  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Accept-Language': 'en', 'Accept': 'application/json' },
    body: formData
  });

  if (loginRes.status !== 200) {
    const text = await loginRes.text();
    console.error(`Login failed: ${loginRes.status} ${text}`);
    return;
  }

  const loginData = await loginRes.json();
  const token = loginData.data.tokens?.access_token || loginData.data.accessToken || loginData.data.token || loginData.access_token;
  console.log('Token obtained:', token ? 'yes' : 'no');

  if (token) {
    const profileRes = await fetch(`${baseUrl}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Accept-Language': 'en'
      }
    });
    const profileData = await profileRes.json();
    console.log('Profile raw response data fields:');
    console.log(JSON.stringify(profileData, null, 2));
  }
}

run().catch(console.error);
