const token = '377|KvfeDcvkAWuRP0kOFctWYBe7atYyaHWAyzk06VEtaeffbb8a'; // Active token
const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  try {
    const formData = new FormData();
    
    // Append languages
    formData.append('languages[0][language]', 'English');
    formData.append('languages[0][level]', 'fluent');
    
    // Append education
    formData.append('education[0][university]', 'Test University');
    formData.append('education[0][level_of_education]', 'bachelor');
    formData.append('education[0][graduation_year]', '2025');
    formData.append('education[0][specialization]', 'Computer Science');
    formData.append('education[0][final_grade]', 'excellent');
    
    // Append work experience
    formData.append('work_experience[0][company_name]', 'Test Company');
    formData.append('work_experience[0][department]', 'Engineering');
    formData.append('work_experience[0][start_date]', '2020-01-01');
    formData.append('work_experience[0][end_date]', '2022-01-01');
    formData.append('work_experience[0][currently_working]', '0');
    formData.append('work_experience[0][responsibilities]', 'Developer');

    // Append skills
    formData.append('skills[0][skill_name]', 'React');
    formData.append('skills[1][skill_name]', 'Node');

    console.log('Sending POST to /portfolio...');
    const postRes = await fetch(`${baseUrl}/portfolio`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    console.log('POST status:', postRes.status);
    const postData = await postRes.json();
    console.log('POST response:', JSON.stringify(postData, null, 2));

    if (postRes.ok) {
      console.log('\nFetching GET /portfolio to verify persistence...');
      const getRes = await fetch(`${baseUrl}/portfolio`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const getData = await getRes.json();
      console.log('GET response:', JSON.stringify(getData, null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}

run();
