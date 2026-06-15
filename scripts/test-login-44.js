(async () => {
  try {
    const baseUrl = 'http://localhost:3000'
    const email = 'test44@example.com'
    const password = 'Fcis_it4'

    console.log(`Logging in to ${baseUrl}/api/auth/login as ${email}`)
    const resp = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': 'ar' },
      body: JSON.stringify({ email, password }),
    })

    console.log('LOGIN STATUS:', resp.status)
    const bodyText = await resp.text()
    console.log('LOGIN BODY:', bodyText)

    const setCookie = resp.headers.get('set-cookie')
    console.log('SET-COOKIE RAW:', setCookie)

    let cookies = ''
    if (setCookie) {
      const parts = setCookie.split(',').map(s => s.split(';')[0].trim())
      cookies = parts.join('; ')
      console.log('COOKIES HEADER:', cookies)
    }

    // Try calling profile route using returned cookies
    const profileRes = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'GET',
      headers: { 'Accept-Language': 'ar', ...(cookies ? { cookie: cookies } : {}) }
    })
    console.log('PROFILE STATUS:', profileRes.status)
    console.log('PROFILE BODY:', await profileRes.text())

    // Try to access company jobs page API to reproduce the error
    const jobsRes = await fetch(`${baseUrl}/api/company/jobs?page=1`, {
      method: 'GET',
      headers: { 'Accept-Language': 'ar', ...(cookies ? { cookie: cookies } : {}) }
    })
    console.log('/api/company/jobs status:', jobsRes.status)
    try {
      console.log('jobs body:', await jobsRes.json())
    } catch { console.log('jobs text:', await jobsRes.text()) }

  } catch (err) {
    console.error('ERROR', err)
    process.exit(1)
  }
})()
