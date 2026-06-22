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
      const id = 17;
      const res = await fetch(`${baseUrl}/users?filter[id]=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar'
        }
      });
      const data = await res.json();
      console.log("Filtered user response keys:", Object.keys(data));
      const list = data.data || data;
      console.log("Filtered user response list length:", list.length);
      if (Array.isArray(list) && list.length > 0) {
        console.log("User at index 0:", JSON.stringify(list[0], null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  }
}

run();
