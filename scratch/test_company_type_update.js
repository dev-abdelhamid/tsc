const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function getProfile(token) {
  const getRes = await fetch(`${baseUrl}/auth/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Accept-Language': 'ar'
    }
  });
  const getData = await getRes.json();
  return getData.data;
}

async function updateProfile(token, fields) {
  const profileForm = new FormData();
  // Add required basic fields
  profileForm.append('name', 'شريكتي الجديدة');
  profileForm.append('phone', '20123456789');
  profileForm.append('country_id', '1');
  profileForm.append('city_id', '1');
  profileForm.append('description[ar]', 'وصف تفصيلي');

  for (const [k, v] of Object.entries(fields)) {
    profileForm.append(k, v);
  }

  const res = await fetch(`${baseUrl}/auth/profile`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Accept-Language': 'ar'
    },
    body: profileForm
  });
  return res.status;
}

async function run() {
  console.log('Logging in...');
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
  if (!token) {
    console.log('Login failed:', JSON.stringify(loginData, null, 2));
    return;
  }

  // Test 1: company_type_id
  console.log('Testing company_type_id...');
  await updateProfile(token, { company_type_id: '2' });
  let profile = await getProfile(token);
  console.log('companyType after company_type_id:', profile.companyProfile?.companyType);

  // Test 2: company_type
  console.log('Testing company_type...');
  await updateProfile(token, { company_type: '2' });
  profile = await getProfile(token);
  console.log('companyType after company_type:', profile.companyProfile?.companyType);

  // Test 3: company_type_id inside companyProfile?
  console.log('Testing companyProfile[company_type_id]...');
  await updateProfile(token, { 'company_profile[company_type_id]': '2' });
  profile = await getProfile(token);
  console.log('companyType after company_profile[company_type_id]:', profile.companyProfile?.companyType);
}

run().catch(console.error);
