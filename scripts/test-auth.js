(async () => {
  try {
    const loginUrl = 'http://localhost:3000/api/auth/login'
    const debugUrl = 'http://localhost:3000/api/admin/tickets/5?debug=1'
    const body = { email: 'admin@example.com', password: 'password123', type: 'admin' }

    const resp = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': 'ar' },
      body: JSON.stringify(body),
    })

    const text = await resp.text()
    console.log('LOGIN STATUS:', resp.status)
    console.log('LOGIN BODY:', text)

    const setCookie = resp.headers.get('set-cookie')
    console.log('SET-COOKIE:', setCookie)

    const headers = { 'Accept-Language': 'ar' }
    if (setCookie) {
      const cookies = setCookie.split(',').map(s => s.split(';')[0].trim()).join('; ')
      headers['cookie'] = cookies
    }

    const dbg = await fetch(debugUrl, { headers })
    console.log('DEBUG STATUS:', dbg.status)
    console.log('DEBUG BODY:', await dbg.text())
  } catch (err) {
    console.error('ERROR', err)
    process.exit(1)
  }
})()
