(async () => {
  try {
    const baseUrl = 'https://cv.subcodeco.com/api/v1'
    const form = new FormData()
    form.append('email', 'admin@example.com')
    form.append('password', 'password123')
    form.append('type', 'user')

    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Accept-Language': 'ar' },
      body: form,
    })

    console.log('STATUS:', res.status, res.statusText)
    console.log('HEADERS:')
    res.headers.forEach((v, k) => console.log(`${k}: ${v}`))
    console.log('set-cookie:', res.headers.get('set-cookie'))
    const text = await res.text()
    console.log('BODY:', text)
  } catch (err) {
    console.error('ERROR', err)
    process.exitCode = 1
  }
})()
