const baseUrl = 'https://cv.subcodeco.com/api/v1';

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
    console.error('Failed to log in:', loginData);
    return;
  }

  // Create a dummy blob/file
  const fileData = Buffer.from('dummy image content');
  const blob = new Blob([fileData], { type: 'image/png' });

  console.log('Uploading with key "logo"...');
  const uploadForm = new FormData();
  uploadForm.append('logo', blob, 'logo.png');

  const uploadRes = await fetch(`${baseUrl}/auth/profile`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: uploadForm
  });

  const uploadData = await uploadRes.json().catch(err => ({ error: err.message }));
  console.log('Upload Logo Status:', uploadRes.status);
  console.log('Upload Logo Response:', JSON.stringify(uploadData, null, 2));

  console.log('Uploading with key "avatar"...');
  const uploadForm2 = new FormData();
  uploadForm2.append('avatar', blob, 'avatar.png');

  const uploadRes2 = await fetch(`${baseUrl}/auth/profile`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: uploadForm2
  });

  const uploadData2 = await uploadRes2.json().catch(err => ({ error: err.message }));
  console.log('Upload Avatar Status:', uploadRes2.status);
  console.log('Upload Avatar Response:', JSON.stringify(uploadData2, null, 2));
}

run().catch(console.error);
