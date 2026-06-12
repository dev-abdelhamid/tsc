const baseUrl = 'http://localhost:3000';

async function run() {
  console.log('1. Logging in locally...');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'ar'
    },
    body: JSON.stringify({ email: 'test3@example.com', password: 'Fcis_it4', type: 'company' })
  });

  const loginData = await loginRes.json();
  const cookies = loginRes.headers.get('set-cookie');
  if (!cookies) {
    console.error('No cookies returned');
    return;
  }

  console.log('\n2. Fetching profile via GET /api/auth/profile...');
  const res = await fetch(`${baseUrl}/api/auth/profile`, {
    headers: {
      'Cookie': cookies,
      'Accept-Language': 'ar'
    }
  });

  console.log('Status:', res.status, res.statusText);
  const data = await res.json();
  const cp = data?.data?.companyProfile || data?.companyProfile;
  console.log('Logo URL from GET:', cp?.logoUrl);
  console.log('Full Company Profile:', JSON.stringify(cp, null, 2));
}

run().catch(console.error);
