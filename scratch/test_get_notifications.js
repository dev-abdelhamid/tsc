const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  console.log('Logging in as user test44@example.com...');
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
    console.error('Failed to log in:', JSON.stringify(loginData, null, 2));
    return;
  }

  console.log('Fetching notifications with Accept-Language: ar...');
  const getResAr = await fetch(`${baseUrl}/notifications?page=1`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Accept-Language': 'ar',
      'X-Requested-Locale': 'ar'
    }
  });
  const dataAr = await getResAr.json();
  console.log('AR notifications:', JSON.stringify(dataAr, null, 2));

  console.log('Fetching unread count...');
  const getUnread = await fetch(`${baseUrl}/notifications/unread-count`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Accept-Language': 'ar',
      'X-Requested-Locale': 'ar'
    }
  });
  const unreadData = await getUnread.json();
  console.log('Unread count response:', JSON.stringify(unreadData, null, 2));
}

run().catch(console.error);
