const baseUrl = 'http://localhost:3000';

async function run() {
  console.log('1. Logging in...');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'de'
    },
    body: JSON.stringify({ email: 'test3@example.com', password: 'Fcis_it4', type: 'company' })
  });

  console.log('Login Status:', loginRes.status);
  const loginData = await loginRes.json();
  const cookies = loginRes.headers.get('set-cookie');
  if (!cookies) {
    console.error('No cookies returned. Make sure the local server is running on port 3000.');
    return;
  }

  console.log('\n2. Fetching profile using cookies...');
  const profileRes = await fetch(`${baseUrl}/api/auth/profile`, {
    headers: {
      'Cookie': cookies,
      'Accept-Language': 'de'
    }
  });

  console.log('Profile GET Status:', profileRes.status);
  const profileData = await profileRes.json();
  console.log('Profile GET Body keys:', Object.keys(profileData || {}));
  console.log('Profile GET Body data keys:', Object.keys(profileData?.data || {}));
  console.log('Full Profile Response:', JSON.stringify(profileData, null, 2));
}

run().catch(console.error);
