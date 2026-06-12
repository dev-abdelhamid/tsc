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
      const res = await fetch(`${baseUrl}/users?per_page=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar'
        }
      });
      const data = await res.json();
      console.log('Total users:', data.data?.length || data?.length || 0);
      const list = data.data || data || [];
      list.forEach(u => {
        console.log(`User ID: ${u.id} | Name: ${u.name} | Email: ${u.email} | Portfolio ID: ${u.portfolio?.id || u.userPortfolio?.id || 'none'}`);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

run();
