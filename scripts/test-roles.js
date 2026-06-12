(async () => {
  try {
    const urls = [
      'http://localhost:3000/api/admin/tickets/5?as=admin',
      'http://localhost:3000/api/company/tickets/5?as=company',
      'http://localhost:3000/api/user/tickets/1?as=user',
      'http://localhost:3000/api/user/tickets?as=user',
    ]

    for (const u of urls) {
      const res = await fetch(u, { headers: { 'Accept-Language': 'ar' } })
      console.log('URL:', u)
      console.log('STATUS:', res.status)
      const txt = await res.text()
      try { console.log(JSON.stringify(JSON.parse(txt), null, 2)) } catch { console.log(txt) }
      console.log('----')
    }
  } catch (err) {
    console.error('ERROR', err)
    process.exit(1)
  }
})()
