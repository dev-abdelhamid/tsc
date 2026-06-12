const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
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
    console.error('Failed to log in:', loginData);
    return;
  }

  const fileData = Buffer.from('dummy image content');
  const blob = new Blob([fileData], { type: 'image/png' });

  // Test logo key
  const uploadForm1 = new FormData();
  uploadForm1.append('logo', blob, 'logo.png');
  const uploadRes1 = await fetch(`${baseUrl}/auth/profile`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Accept-Language': 'ar' },
    body: uploadForm1
  });
  const data1 = await uploadRes1.json().catch(() => ({}));
  console.log('Logo key upload status:', uploadRes1.status);
  console.log('Logo key upload response message:', data1.message || data1.error);

  // Test avatar key
  const uploadForm2 = new FormData();
  uploadForm2.append('avatar', blob, 'avatar.png');
  const uploadRes2 = await fetch(`${baseUrl}/auth/profile`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Accept-Language': 'ar' },
    body: uploadForm2
  });
  const data2 = await uploadRes2.json().catch(() => ({}));
  console.log('Avatar key upload status:', uploadRes2.status);
  console.log('Avatar key upload response message:', data2.message || data2.error);
  if (uploadRes2.ok) {
    console.log('Avatar upload response companyProfile:', JSON.stringify(data2.data?.companyProfile, null, 2));
  }
}

run().catch(console.error);
