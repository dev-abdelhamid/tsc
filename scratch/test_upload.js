const fs = require('fs');
const path = require('path');

const baseUrl = 'http://localhost:3000';

async function run() {
  console.log('1. Logging in locally...');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'ar'
    },
    body: JSON.stringify({ email: 'test3@example.com', password: 'Fcis_it4', type: 'company' })
  });

  const loginData = await loginRes.json();
  const cookies = loginRes.headers.get('set-cookie');
  if (!cookies) {
    console.error('No cookies returned');
    return;
  }

  console.log('\n2. Preparing form data with a real file...');
  // Find a small image file in the project to upload
  const imgPath = path.join(__dirname, '..', 'public', 'auth', 'arrows.png');
  if (!fs.existsSync(imgPath)) {
    console.error(`Image path does not exist: ${imgPath}`);
    return;
  }

  const fileBuffer = fs.readFileSync(imgPath);
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  
  // Construct raw multipart request body manually since we are in raw Node.js
  const parts = [];
  
  // File field: logo
  parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="logo"; filename="arrows.png"\r\nContent-Type: image/png\r\n\r\n`));
  parts.push(fileBuffer);
  parts.push(Buffer.from(`\r\n`));

  // Other fields
  const fields = {
    name: 'شركتي بالصورة الجديدة',
    website: 'https://test-company-upload.com',
    country_id: '1',
    city_id: '1',
    phone: '20123456789',
    postal_code: '12345',
    num_of_employees: '80',
    company_type_id: '2',
    'company_name[ar]': 'شركتي بالصورة الجديدة',
    'company_name[en]': 'My Upload Test Company',
    'company_name[de]': 'Meine Upload Testfirma',
    'ceo_name[ar]': 'الرئيس التنفيذي الجديد',
    'ceo_name[en]': 'New CEO Upload',
    'ceo_name[de]': 'Neuer CEO upload',
    'description[ar]': 'وصف الشركة من خلال الرفع',
    'description[en]': 'Upload test description',
    'description[de]': 'Upload Testbeschreibung',
    facebook: 'https://facebook.com/uploadtest',
    linkedin: 'https://linkedin.com/company/uploadtest',
    twitter_x: 'https://x.com/uploadtest',
    pinterest: 'https://pinterest.com/uploadtest'
  };

  for (const [key, value] of Object.entries(fields)) {
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`));
  }
  parts.push(Buffer.from(`--${boundary}--\r\n`));

  const bodyBuffer = Buffer.concat(parts);

  console.log('Sending upload request...');
  const res = await fetch(`${baseUrl}/api/auth/profile`, {
    method: 'POST',
    headers: {
      'Cookie': cookies,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Accept-Language': 'ar'
    },
    body: bodyBuffer
  });

  console.log('Status:', res.status, res.statusText);
  const data = await res.json();
  console.log('Response body:', JSON.stringify(data, null, 2));
}

run().catch(console.error);
