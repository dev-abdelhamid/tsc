;(async () => {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001'
    const email = process.env.TEST_EMAIL || 'test3@example.com'
    const password = process.env.TEST_PASSWORD || 'password'
    const type = process.env.TEST_TYPE || 'user'

    console.log(`Logging in to ${baseUrl}/api/auth/login as ${email}`)
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': 'ar' },
      body: JSON.stringify({ email, password, type }),
    })

    console.log('Login STATUS:', loginRes.status)
    const loginText = await loginRes.text()
    console.log('Login BODY:', loginText)
    const setCookie = loginRes.headers.get('set-cookie') || loginRes.headers.get('Set-Cookie')
    console.log('SET-COOKIE raw:', setCookie)

    if (!setCookie) {
      console.error('No Set-Cookie returned from /api/auth/login')
      process.exit(1)
    }

    // Build a Cookie header value from the Set-Cookie string (take first cookie pair)
    const cookiePair = setCookie.split(',').pop().split(';')[0].trim()

    const profileRes = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'GET',
      headers: { Cookie: cookiePair, 'Accept-Language': 'ar' },
    })

    console.log('Profile STATUS:', profileRes.status)
    const profileBody = await profileRes.text()
    console.log('Profile BODY:', profileBody)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()
