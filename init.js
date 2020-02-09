
module.exports = async function () {
  console.log('enter dapp init')

  app.registerContract(1000, 'certificate.issue_certificate')
  app.registerContract(1001, 'certificate.sign')


  app.events.on('newBlock', (block) => {
    console.log('new block received', block.height)
  })
}

//  app.registerContract(1001, 'domain.set_ip')