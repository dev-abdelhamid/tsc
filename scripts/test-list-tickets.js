(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/admin/tickets?as=admin');
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
})();
