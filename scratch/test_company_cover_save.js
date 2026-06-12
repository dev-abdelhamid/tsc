const baseUrl = 'https://cv.subcodeco.com/api/v1';
const fs = require('fs');
const path = require('path');

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

  // Read a real png from public/
  const imgPath = path.join(__dirname, '..', 'public', 'logo-dark.png');
  const fileBuffer = fs.readFileSync(imgPath);
  const fileBlob = new Blob([fileBuffer], { type: 'image/png' });

  console.log('Uploading real PNG as "cover_image"...');
  const uploadForm = new FormData();
  uploadForm.append('cover_image', fileBlob, 'logo-dark.png');

  const uploadRes = await fetch(`${baseUrl}/auth/profile`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Accept-Language': 'ar'
    },
    body: uploadForm
  });

  const uploadData = await uploadRes.json().catch(() => ({}));
  console.log('Upload Status:', uploadRes.status);
  console.log('Company Profile Cover URL:', uploadData.data?.companyProfile?.coverImageUrl);
}

run().catch(console.error);
