;(async () => {
  try {
    const url = 'http://localhost:3000/api/auth/session'
    const body = {
      user: { id: 1, name: 'Local Test', email: 'local@example.com' },
      tokens: { access_token: 'AT_LOCAL_123', refresh_token: 'RT_LOCAL_456', expires_in: 3600 },
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': 'ar' },
      body: JSON.stringify(body),
    })

    console.log('STATUS:', resp.status)
    const text = await resp.text()
    console.log('BODY:', text)
    console.log('SET-COOKIE:', resp.headers.get('set-cookie'))
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()
