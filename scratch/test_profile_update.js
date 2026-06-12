const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  console.log('Waiting 3 seconds to avoid rate limit...');
  await new Promise(r => setTimeout(r, 3100));

  // Login
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
  
  if (!token) {
    console.error('Failed to log in!');
    return;
  }

  console.log('Sending profile update...');
  const profileForm = new FormData();
  profileForm.append('first_name', 'عبدالحميد');
  profileForm.append('last_name', 'ضاحي');
  profileForm.append('gender', 'male');
  profileForm.append('date_of_birth', '1995-05-20');
  profileForm.append('country_id', '2');
  profileForm.append('phone', '966555555555');
  profileForm.append('category_id', '2');
  profileForm.append('subcategory_id', '4'); // let's try subcategory 4 (or whatever is valid)

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

  // Fetch updated profile
  console.log('Waiting 3 seconds before fetching...');
  await new Promise(r => setTimeout(r, 3100));

  const getRes = await fetch(`${baseUrl}/auth/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Accept-Language': 'ar'
    }
  });

  const getData = await getRes.json();
  console.log('Fetched profile after update:');
  console.log(JSON.stringify(getData.data?.Userprofile, null, 2));
  console.log('Fetched country after update:', JSON.stringify(getData.data?.country, null, 2));
}

run().catch(console.error);
