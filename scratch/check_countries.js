fetch("http://localhost:3000/api/countries?locale=en")
  .then(r => r.json())
  .then(data => {
    console.log(data.data?.map(c => ({ id: c.id, name: c.name, code: c.code })))
  })
  .catch(err => console.error("Error:", err))
