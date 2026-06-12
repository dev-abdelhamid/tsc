(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'ar'
      },
      body: JSON.stringify({ email: 'admin@example.com', password: 'password123', type: 'user' }),
      // include credentials if needed by fetch implementation
    })

    console.log('STATUS:', res.status, res.statusText)
    console.log('HEADERS:')
    res.headers.forEach((v, k) => console.log(`${k}: ${v}`))
    const text = await res.text()
    console.log('BODY:', text)
  } catch (err) {
    console.error('ERROR', err)
    process.exitCode = 1
  }
})()
