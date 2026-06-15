const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

async function run() {
  console.log('1. Logging in locally as company test3@example.com...');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'ar'
    },
    body: JSON.stringify({ email: 'test3@example.com', password: 'Fcis_it4', type: 'company' })
  });

  console.log('Login Status:', loginRes.status, loginRes.statusText);
  const loginData = await loginRes.json();
  console.log('Login Body:', JSON.stringify(loginData, null, 2));

  // Extract cookies from response
  const cookies = loginRes.headers.get('set-cookie');
  console.log('Cookies received:', cookies);

  if (!cookies) {
    console.error('No cookies returned. Cannot proceed with session-based requests.');
    return;
  }

  console.log('\n2. Verifying session via /api/auth/profile (session endpoint removed)...');
  // The old /api/auth/session endpoint was removed. Verify by fetching profile using the cookie
  const cookiePair = cookies.split(',').pop().split(';')[0].trim();
  const sessionRes = await fetch(`${baseUrl}/api/auth/profile`, {
    method: 'GET',
    headers: {
      'Cookie': cookiePair,
      'Accept-Language': 'ar'
    }
  });

  console.log('Profile Status:', sessionRes.status);
  const sessionData = await sessionRes.json();
  console.log('Profile Body:', JSON.stringify(sessionData, null, 2));

  console.log('\n3. Fetching profile via /api/auth/profile GET...');
  const profileGetRes = await fetch(`${baseUrl}/api/auth/profile`, {
    headers: {
      'Cookie': cookies,
      'Accept-Language': 'ar'
    }
  });

  console.log('Profile GET Status:', profileGetRes.status);
  const profileGetData = await profileGetRes.json();
  console.log('Profile GET Body:', JSON.stringify(profileGetData, null, 2));

  console.log('\n4. Sending profile update to /api/auth/profile POST...');
  // Construct FormData
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const payloadParts = [];

  const fields = {
    name: 'شريكتي الجديدة التابعة',
    website: 'https://test-company-local.com',
    country_id: '1',
    city_id: '1',
    phone: '20123456789',
    postal_code: '12345',
    num_of_employees: '75',
    company_type_id: '2',
    'company_name[ar]': 'شريكتي الجديدة التابعة',
    'company_name[en]': 'My Local Test Company',
    'company_name[de]': 'Meine lokale Testfirma',
    'ceo_name[ar]': 'الرئيس التنفيذي الجديد',
    'ceo_name[en]': 'New CEO Local',
    'ceo_name[de]': 'Neuer CEO lokal',
    'description[ar]': 'وصف الشركة من خلال تيست لوكال',
    'description[en]': 'Local test description',
    'description[de]': 'Lokale Testbeschreibung',
    facebook: 'https://facebook.com/localtest',
    linkedin: 'https://linkedin.com/company/localtest',
    twitter_x: 'https://x.com/localtest',
    pinterest: 'https://pinterest.com/localtest'
  };

  for (const [key, value] of Object.entries(fields)) {
    payloadParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`);
  }
  payloadParts.push(`--${boundary}--\r\n`);
  const payloadBuffer = Buffer.from(payloadParts.join(''));

  const profileUpdateRes = await fetch(`${baseUrl}/api/auth/profile`, {
    method: 'POST',
    headers: {
      'Cookie': cookies,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Accept-Language': 'ar'
    },
    body: payloadBuffer
  });

  console.log('Profile Update Status:', profileUpdateRes.status);
  const profileUpdateData = await profileUpdateRes.json();
  console.log('Profile Update Body:', JSON.stringify(profileUpdateData, null, 2));
}

run().catch(console.error);
