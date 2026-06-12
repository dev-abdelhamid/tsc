const baseUrl = 'https://cv.subcodeco.com/api/v1';

async function run() {
  try {
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
    console.log('Token obtained:', !!token);
    if (!token) return;

    // Get current portfolio first
    const getRes = await fetch(`${baseUrl}/portfolio`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Accept-Language': 'ar'
      }
    });
    const pData = await getRes.json();
    console.log('BEFORE SAVE:');
    console.log('  Languages:', pData.data?.languages);
    console.log('  Education:', pData.data?.education);
    console.log('  Skills:', pData.data?.skills);
    console.log('  Work:', pData.data?.workExperience);

    // Build POST body
    const saveForm = new FormData();
    // Languages
    (pData.data?.languages || []).forEach((lang, idx) => {
      saveForm.append(`languages[${idx}][language]`, lang.language);
      saveForm.append(`languages[${idx}][level]`, lang.level);
      saveForm.append(`languages[${idx}][id]`, String(lang.id));
    });
    // Education
    (pData.data?.education || []).forEach((edu, idx) => {
      saveForm.append(`education[${idx}][university]`, edu.university);
      saveForm.append(`education[${idx}][level_of_education]`, edu.levelOfEducation);
      saveForm.append(`education[${idx}][graduation_year]`, edu.graduationYear);
      saveForm.append(`education[${idx}][specialization]`, edu.specialization);
      saveForm.append(`education[${idx}][final_grade]`, edu.finalGrade);
      saveForm.append(`education[${idx}][id]`, String(edu.id));
    });
    // Work Experience WITHOUT ID to prevent SQL error
    (pData.data?.workExperience || []).forEach((exp, idx) => {
      saveForm.append(`work_experience[${idx}][company_name]`, exp.companyName);
      saveForm.append(`work_experience[${idx}][department]`, exp.department);
      saveForm.append(`work_experience[${idx}][start_date]`, exp.startDate);
      saveForm.append(`work_experience[${idx}][currently_working]`, exp.currentlyWorking ? '1' : '0');
      saveForm.append(`work_experience[${idx}][responsibilities]`, exp.responsibilities || '');
    });
    // Skills
    (pData.data?.skills || []).forEach((skill, idx) => {
      saveForm.append(`skills[${idx}][skill_name]`, skill.skillName);
      saveForm.append(`skills[${idx}][id]`, String(skill.id));
    });

    console.log('--- Saving... ---');
    const postRes = await fetch(`${baseUrl}/portfolio`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Accept-Language': 'ar'
      },
      body: saveForm
    });
    console.log('Save status:', postRes.status);

    // Get portfolio after save
    const getResAfter = await fetch(`${baseUrl}/portfolio`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Accept-Language': 'ar'
      }
    });
    const pDataAfter = await getResAfter.json();
    console.log('AFTER SAVE:');
    console.log('  Languages:', pDataAfter.data?.languages);
    console.log('  Education:', pDataAfter.data?.education);
    console.log('  Skills:', pDataAfter.data?.skills);
    console.log('  Work:', pDataAfter.data?.workExperience);

  } catch (err) {
    console.error(err);
  }
}

run();
