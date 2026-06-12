const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  const formData = new FormData();
  formData.append('email', 'test2@example.com');
  formData.append('password', 'Fcis_it4');

  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Accept-Language': 'en', 'Accept': 'application/json' },
    body: formData
  });

  console.log('Login Response Status:', loginRes.status);
  const loginData = await loginRes.json().catch(err => ({ error: err.message }));
  console.log('Login Response Data:', JSON.stringify(loginData, null, 2));
}

run().catch(console.error);
