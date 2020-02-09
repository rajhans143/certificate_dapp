
  let AschJS = require('asch-js')
  let bignum = require('bignumber')
  let crypto = require('crypto')
  // let crypto = require('../utils/transactions/crypto.js')
  let config = require('../config.json')
  let ByteBuffer = require('bytebuffer')
//address,name,id,university,coursename,dateofissue,enrollmentId
 module.exports = {
  issue_certificate: async function(name,id,university,coursename,dateofissue,enrollmentId) {
    let exists = await app.model.Certificate.exists({ enrollmentId: enrollmentId})
    if (exists) return ' Certificate already issued'

    app.sdb.create('Certificate', {
     // address: this.trs.address,
      name: name,
      id: id,
      university: university,
      coursename: coursename,
      dateofissue:dateofissue,
      enrollmentId:enrollmentId
    })
    app.logger.debug('Certificate issued')
  },
  
  sign: async function(enrollmentId) {
    let signatures = []

    let buffer = new ByteBuffer(1, true)
    //buffer.writeInt(1007)
    buffer.writeString(enrollmentId)
    //buffer.writeInt(choice)
    buffer.flip()

    // let buffer = new ByteBuffer(1, true)
    // buffer.writeInt(1007)
    // buffer.writeString(mid)
    // buffer.writeInt(0)
    // buffer.flip()
    
    let bytes = buffer.toBuffer()
    let secret = 'offer cry duck relief work nerve concert penalty demand impulse bonus vague';
    function signBytes(bytes, secret) {
      let keys = AschJS.crypto.getKeys(secret)
      return AschJS.crypto.signBytes(bytes, keys)
    }
    
    function getPublicKey(secret) {
      return AschJS.crypto.getKeys(secret).publicKey
    }


    for (let i = 0; i < Math.floor(config.secrets.length / 2) + 1; ++i) {
      let pk = getPublicKey(config.secrets[i])
      let sig = signBytes(bytes, config.secrets[i])
      signatures.push(pk + sig)
    }
console.log("signatures :   "+signatures);
    let keysigs = signatures;//.string.split(',')
    let publicKeys = []
    let sigs = []
    for (let ks of keysigs) {
      if (ks.length !== 192) return 'Invalid public key or signature'
      publicKeys.push(ks.substr(0, 64))
      sigs.push(ks.substr(64, 192))
    }
    let uniqPublicKeySet = new Set()
    for (let pk of publicKeys) {
      uniqPublicKeySet.add(pk)
    }  if (uniqPublicKeySet.size !== publicKeys.length) return 'Duplicated public key'

  let sigCount = 0
  for (let i = 0; i < publicKeys.length; ++i) {
    let pk = publicKeys[i]
    let sig = sigs[i]
    if (app.meta.delegates.indexOf(pk) !== -1 && app.verifyBytes(buffer.toBuffer(), pk, sig)) {
      sigCount++
    }
  }
  console.log("sigCount  : "+sigCount);
//  //if (sigCount < Math.floor(app.meta.delegates.length / 2) + 1) return 'Signatures not enough'
//   app.sdb.create('Domainsign', {
//     address: address,
//     owner: this.trs.senderId,
//     suffix: address.split('.').pop(),
//     sign1:signatures,
//     tid:this.trs.id
//   })
//   app.sdb.update('Domain', { sign1: "signed" }, { address: address })

  }
}


