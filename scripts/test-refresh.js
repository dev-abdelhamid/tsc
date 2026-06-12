(async () => {
  try {
    const url = 'http://localhost:3000/api/auth/test-refresh'
    const body = { refresh_token: 'TSngsZgSWHvGTi8mlA7iM8GKzQGCvIc8qv95Q95sf1StQtLIyHRXAExReX4aHvoE' }
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': 'ar' },
      body: JSON.stringify(body),
    })
    const text = await resp.text()
    console.log('STATUS:', resp.status)
    console.log('BODY:', text)
  } catch (err) {
    console.error('ERROR', err)
    process.exit(1)
  }
})()
