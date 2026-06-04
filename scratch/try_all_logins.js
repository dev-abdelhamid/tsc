const baseUrl = 'https://cv.subcodeco.com/api/v1';
const emails = [
  ' takwa@mail.com',
  'takwa@mail.com',
  'takwa@mail.com ',
  'takwa@mail.com',
  'adham@gmail.com',
  'test2@example.com',
  'test3@example.com'
];
const passwords = ['Fcis_it4', 'password123', 'takwa123', 'takwa1234', 'Takwa123', 'Takwa1234'];

async function tryLogin(email, password) {
  try {
    const formData = new FormData();
    formData.append('email', email.trim());
    formData.append('password', password);

    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'ar'
      },
      body: formData
    });

    if (res.status === 200) {
      const data = await res.json();
      console.log(`SUCCESS: ${email} with password ${password}`);
      console.log(`Roles:`, data.data.user.roles);
      return data.data.accessToken;
    } else {
      const text = await res.text();
      // Only print if it's not a standard invalid credentials error
      if (!text.includes('بيانات الاعتماد') && !text.includes('credentials')) {
        console.log(`Status ${res.status} for ${email} with ${password}`);
      }
    }
  } catch (err) {
    console.error(`Error for ${email}:`, err.message);
  }
  return null;
}

async function run() {
  for (const email of emails) {
    for (const pw of passwords) {
      const token = await tryLogin(email, pw);
      if (token) {
        try {
          const pref = await fetch(`${baseUrl}/portfolio`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          const pdata = await pref.json();
          console.log(`Portfolio for ${email}:`, JSON.stringify(pdata, null, 2));
        } catch (e) {
          console.error(`Failed to fetch portfolio for ${email}:`, e.message);
        }
      }
    }
  }
}

run();
