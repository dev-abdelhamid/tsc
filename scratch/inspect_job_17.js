async function checkJob() {
  const url = 'https://cv.subcodeco.com/api/v1/public/jobs/17';
  console.log('Fetching', url);
  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'ar' } });
    console.log('Status:', res.status);
    const body = await res.json();
    console.log('Body:', JSON.stringify(body, null, 2).slice(0, 1000));
  } catch (err) {
    console.error(err);
  }
}

checkJob();
