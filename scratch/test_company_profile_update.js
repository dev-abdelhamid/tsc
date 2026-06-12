const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  console.log('Logging in as company test3@example.com...');
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
    console.error('Failed to log in:', JSON.stringify(loginData, null, 2));
    return;
  }

  console.log('Fetching initial company profile...');
  const getRes1 = await fetch(`${baseUrl}/auth/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Accept-Language': 'ar'
    }
  });
  const getData1 = await getRes1.json();
  console.log('Initial company profile details:', JSON.stringify(getData1.data, null, 2));

  console.log('Sending company profile update...');
  const profileForm = new FormData();
  profileForm.append('name', 'شريكتي الجديدة');
  profileForm.append('website', 'https://example-company.com');
  profileForm.append('country_id', '1');
  profileForm.append('city_id', '1');
  profileForm.append('phone', '20123456789');
  profileForm.append('postal_code', '12345');
  profileForm.append('num_of_employees', '50');
  profileForm.append('company_type_id', '2');
  
  // Localized fields
  profileForm.append('company_name[ar]', 'شريكتي الجديدة');
  profileForm.append('company_name[en]', 'My New Company');
  profileForm.append('company_name[de]', 'Meine neue Firma');
  profileForm.append('ceo_name[ar]', 'المدير التنفيذي');
  profileForm.append('ceo_name[en]', 'The CEO');
  profileForm.append('ceo_name[de]', 'Der CEO');
  profileForm.append('description[ar]', 'وصف تفصيلي للشركة');
  profileForm.append('description[en]', 'Detailed company description');
  profileForm.append('description[de]', 'Detaillierte Firmenbeschreibung');

  profileForm.append('facebook', 'https://facebook.com/mycompany');
  profileForm.append('linkedin', 'https://linkedin.com/company/mycompany');
  profileForm.append('twitter_x', 'https://x.com/mycompany');
  profileForm.append('pinterest', 'https://pinterest.com/mycompany');

  const updateRes = await fetch(`${baseUrl}/auth/profile`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Accept-Language': 'ar'
    },
    body: profileForm
  });

  const updateData = await updateRes.json();
  console.log('Update Response Status:', updateRes.status);
  console.log('Update Response Data:', JSON.stringify(updateData, null, 2));
}

run().catch(console.error);
