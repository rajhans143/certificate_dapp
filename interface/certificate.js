app.route.get('/certificate/:id',  async function (req) {
  let result = await app.model.Certificate.findOne({
      condition: { id: req.params.id }
  })
  return result
})

app.route.get('/certificate/:enrollmentId',  async function (req) {
  let result = await app.model.Certificate.findOne({
      condition: { enrollmentId: req.params.enrollmentId }
  })
  return result
})

