async function checkJob() {
  const url = 'https://cv.subcodeco.com/api/v1/jobs/20';
  console.log('Fetching', url);
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    const body = await res.text();
    console.log('Body:', body.slice(0, 1000));
  } catch (err) {
    console.error(err);
  }
}

checkJob();
