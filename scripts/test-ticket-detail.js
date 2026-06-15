(async () => {
  try {
    const loginUrl = 'http://localhost:3000/api/auth/login'
    const detailUrl = 'http://localhost:3000/api/admin/tickets/5'
    const body = { email: 'admin@example.com', password: 'password123', type: 'admin' }

    const resp = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': 'ar' },
      body: JSON.stringify(body),
    })

    const jsonBody = await resp.json().catch(() => null)
    console.log('LOGIN STATUS:', resp.status)
    console.log('LOGIN BODY:', JSON.stringify(jsonBody))

    const setCookie = resp.headers.get('set-cookie')
    console.log('SET-COOKIE:', setCookie)

    const headers = { 'Accept-Language': 'ar' }
    if (setCookie) {
      const cookies = setCookie.split(',').map(s => s.split(';')[0].trim()).join('; ')
      headers['cookie'] = cookies
    }

    // If backend token is returned in JSON, try calling upstream API directly
    const rawToken = jsonBody && jsonBody.tokens && jsonBody.tokens.access_token ? jsonBody.tokens.access_token : null
    if (rawToken) {
      try {
        const upstream = await fetch('https://cv.subcodeco.com/api/v1/tickets/5', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${rawToken}`, 'Accept-Language': 'ar' }
        })
        console.log('UPSTREAM RAW STATUS:', upstream.status)
        console.log('UPSTREAM RAW BODY:', await upstream.text())
      } catch (err) {
        console.error('UPSTREAM CALL ERROR', err)
      }
    }

    const detail = await fetch(detailUrl, { headers })
    console.log('DETAIL STATUS:', detail.status)
    console.log('DETAIL BODY:', await detail.text())

    // Also fetch ticket list to inspect available IDs
    const listUrl = 'http://localhost:3000/api/admin/tickets?page=1'
    const listRes = await fetch(listUrl, { headers })
    console.log('LIST STATUS:', listRes.status)
    const listText = await listRes.text()
    console.log('LIST BODY:', listText)

      // Test replying to the ticket via the admin route
      try {
        const replyRes = await fetch('http://localhost:3000/api/admin/tickets/5/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept-Language': 'ar', ...(headers.cookie ? { cookie: headers.cookie } : {}) },
          body: JSON.stringify({ message: 'Automated test reply' })
        })
        console.log('REPLY STATUS:', replyRes.status)
        console.log('REPLY BODY:', await replyRes.text())
      } catch (err) {
        console.error('REPLY ERROR', err)
      }

      // Test updating ticket status (FormData)
      try {
        const fd = new FormData()
        fd.append('status', 'open')
        const statusRes = await fetch('http://localhost:3000/api/admin/tickets/5/status', {
          method: 'POST',
          headers: { 'Accept-Language': 'ar', ...(headers.cookie ? { cookie: headers.cookie } : {}) },
          body: fd,
        })
        console.log('STATUS UPDATE STATUS:', statusRes.status)
        console.log('STATUS UPDATE BODY:', await statusRes.text())
      } catch (err) {
        console.error('STATUS UPDATE ERROR', err)
      }
  } catch (err) {
    console.error('ERROR', err)
    process.exit(1)
  }
})()
