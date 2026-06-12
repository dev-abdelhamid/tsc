const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/categories`, {
      headers: { 'Accept-Language': 'ar' }
    });
    const data = await res.json();
    const cats = data.data || data;
    console.log(cats.map(c => ({ id: c.id, name: c.name })));
  } catch (err) {
    console.error(err);
  }
}

run();
