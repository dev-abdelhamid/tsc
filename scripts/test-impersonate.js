(async () => {
  try {
    const url = 'http://localhost:3000/api/admin/tickets/5?as=admin'
    const resp = await fetch(url, { headers: { 'Accept-Language': 'ar' } })
    console.log('STATUS:', resp.status)
    console.log('BODY:', await resp.text())
  } catch (err) {
    console.error('ERROR', err)
    process.exit(1)
  }
})()
