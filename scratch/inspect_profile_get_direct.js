const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function testUser() {
  console.log('Logging in as test44@example.com...');
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
  console.log('User Token:', token ? 'obtained' : 'FAILED');

  if (token) {
    const profileRes = await fetch(`${baseUrl}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Accept-Language': 'ar'
      }
    });
    const profileData = await profileRes.json();
    console.log('=== USER PROFILE GET RESPONSE ===');
    console.log(JSON.stringify(profileData, null, 2));
  }
}

async function testCompany() {
  console.log('Logging in as test3@example.com...');
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
  console.log('Company Token:', token ? 'obtained' : 'FAILED');

  if (token) {
    const profileRes = await fetch(`${baseUrl}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Accept-Language': 'ar'
      }
    });
    const profileData = await profileRes.json();
    console.log('=== COMPANY PROFILE GET RESPONSE ===');
    console.log(JSON.stringify(profileData, null, 2));
  }
}

async function run() {
  await testUser();
  console.log('\n-----------------------------------\n');
  await new Promise(r => setTimeout(r, 2100)); // wait to avoid rate limit
  await testCompany();
}

run().catch(console.error);
