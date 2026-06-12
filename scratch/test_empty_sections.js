const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  try {
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
    console.log('Token:', token ? 'obtained' : 'FAILED');

    if (token) {
      const fd = new FormData();
      // Send ONLY languages and education, omit work_experience and skills
      fd.append('languages[0][language]', 'Spanish');
      fd.append('languages[0][level]', 'beginner');

      fd.append('education[0][university]', 'Cairo Univ');
      fd.append('education[0][level_of_education]', 'bachelor');
      fd.append('education[0][graduation_year]', '2020');
      fd.append('education[0][specialization]', 'Math');
      fd.append('education[0][final_grade]', 'good');

      const res = await fetch(`${baseUrl}/portfolio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar'
        },
        body: fd
      });
      console.log('Response Status:', res.status);
      const data = await res.json();
      console.log('Message:', data.message);
      if (data.errors) console.log('Errors:', JSON.stringify(data.errors, null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}

run();
