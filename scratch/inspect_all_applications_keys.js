const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  try {
    const formData = new FormData();
    formData.append('email', 'admin@example.com');
    formData.append('password', 'password123');

    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Accept-Language': 'ar', 'Accept': 'application/json' },
      body: formData
    });

    const loginData = await loginRes.json();
    const token = loginData.data?.tokens?.access_token || loginData.data?.accessToken || loginData.data?.token || loginData.accessToken;
    
    if (token) {
      const res = await fetch(`${baseUrl}/admin/job-applications?page=1&per_page=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar'
        }
      });
      const data = await res.json();
      const list = data.data || [];
      console.log('Total applications:', list.length);
      list.forEach((app, idx) => {
        console.log(`\nApplication Index ${idx}:`);
        console.log('App Keys:', Object.keys(app));
        if (app.userPortfolio) {
          console.log('Portfolio Keys:', Object.keys(app.userPortfolio));
          console.log('CV:', app.userPortfolio.cv);
        }
        if (app.user) {
          console.log('User field exists!', app.user);
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
}

run();
