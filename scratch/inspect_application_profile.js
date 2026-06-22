const token = '984|iaiqgCLLyU8kui0gS9UxR4fHQ0nWOJ1qD3sOCdAD508cf58c';
const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  const options = [
    'portfolios/17',
    'portfolios?user_id=17',
    'portfolios?id=17',
    'candidate/17',
    'candidates/17',
    'candidate-profile/17',
    'candidate-profiles/17'
  ];

  for (const opt of options) {
    try {
      const url = `${baseUrl}/${opt}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar'
        }
      });
      console.log(`URL [${url}] status: ${res.status}`);
      if (res.status === 200) {
        const text = await res.text();
        console.log(`SUCCESS on ${url}!`);
        console.log(text.substring(0, 1000));
        break;
      }
    } catch (err) {
      console.error(`Error for ${opt}:`, err.message);
    }
  }
}

run();
