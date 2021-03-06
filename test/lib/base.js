let supertest = require('supertest')
let debug = require('debug')('base')
let AschJS = require('asch-js')
let assert = require('chai').assert

let host = 'localhost'
let port = 4096
let baseUrl = 'http://' + host + ':' + port
let baseApi = supertest(baseUrl + '/api')
let genesisAccount = {
  address: 'AMavLoPaD1yAHX67xLekeaEjiDGL6dHpdy',
  //address: 'APqTgWgMZqrswgK1J3FbESHoiYYNeCm5Hz',
 // secret: 'payment exhibit interest tray maximum machine gain need used merry motion three'
 secret : "famous mean response salmon rural glove clump cream insane exhibit ring vacant"
}

let dapp
let id
let dappUrl
let dappApi

function PIFY(fn, receiver) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.apply(receiver, [...args, (err, result) => {
        return err ? reject(err) : resolve(result)
      }])
    })
  }
}

function baseApiGet(path, cb) {
  baseApi.get(path)
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      cb(err, res && res.body)
    })
}

function dappApiGet(path, cb) {
  let seperator = path.indexOf('?') !== -1 ? '&' : '?'
  dappApi.get(path + seperator + '_t=' + (new Date()).getTime())
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      debug('dappApiGet response err: %j, res: ', err, res.body)
      cb(err, res && res.body)
    })
}

function init(cb) {
  baseApiGet('/dapps?name=koumei', function (err, res) {
    debug('init find dapp err: %j, res: ', err, res)
    if (err) return cb('Request error: ' + err)
    if (!res.success) return cb('Server error: ' + err)
    if (!res.dapps.length) return cb('DApp not found')
    dapp = res.dapps[0]
    id = dapp.transactionId
    dappUrl = baseUrl + '/api/dapps/' + id
    dappApi = supertest(dappUrl)
    cb()
  })
}

function getHeight(cb) {
  dappApiGet('/blocks/height', function (err, res) {
    if (err) {
      return cb('Failed to get height: ' + err)
    } else {
      return cb(null, res.height)
    }
  })
}

function sleep(n, cb) {
  setTimeout(cb, n)
}

async function onNewBlockAsync() {
  let firstHeight = await PIFY(getHeight)()
  while (true) {
    await PIFY(sleep)(1000)
    let height = await PIFY(getHeight)()
    if (height > firstHeight) break
  }
}

function randomSecret() {
  return Math.random().toString(36).substring(7);
}

function getRandomAccount() {
  var secret = randomSecret()
  var keys = AschJS.crypto.getKeys(secret)
  return {
    address: AschJS.crypto.getAddress(keys.publicKey),
    publicKey: keys.publicKey,
    secret: secret
  }
}

function randomCoin() {
  return String(Math.floor(Math.random() * (1000 * 100000000)) + (100 * 100000000))
}

function giveMoney(address, currency, amount, cb) {
  dappApi.put('/transactions/unsigned')
    .set('Accept', 'application/json')
    .send({
      secret: genesisAccount.secret,
      fee: '10000000',
      type: 3,
      args: JSON.stringify([
        currency, amount, address
      ])
    })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      debug('giveMoney res err: %j, res: ', err, res.body)
      assert(!err)
      assert(res.body.success)
      cb(err, res)
    })
}

async function giveMoneyAndWaitAsync(addresses, currency, amount) {
  for (let i = 0; i < addresses.length; i++) {
    await PIFY(giveMoney)(addresses[i], currency, amount || randomCoin())
  }
  await onNewBlockAsync()
}

function submitInnerTransaction(trs, cb) {
  debug('submitInnerTransaction input: ', trs)
  dappApi.put('/transactions/signed')
    .set('Accept', 'application/json')
    .send({
      transaction: trs
    })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      debug('submitInnerTransaction response err: %j, res: ', err, res.body)
      cb(err, res.body)
    })
}

async function createMarketAsync(market, secret) {
  let trs = AschJS.dapp.createInnerTransaction({
    fee: '10000000',
    type: 1000,
    args: [
      market.title,
      market.image,
      market.desc,
      market.results,
      market.currency,
      market.margin,
      market.share,
      market.endHeight
    ]
  }, secret)
  return await PIFY(submitInnerTransaction)(trs)
}

async function createTradeAsync(trade, secret) {
  let trs = AschJS.dapp.createInnerTransaction({
    fee: '10000000',
    type: 1001,
    args: [
      trade.mid,
      trade.share,
      trade.choice
    ]
  }, secret)
  return await PIFY(submitInnerTransaction)(trs)
}

async function createSettleAsync(settle, secret) {
  let trs = AschJS.dapp.createInnerTransaction({
    fee: '10000000',
    type: 1002,
    args: [
      settle.mid
    ]
  }, secret)
  return await PIFY(submitInnerTransaction)(trs)
}

async function createRevealAsync(reveal, secret) {
  let trs = AschJS.dapp.createInnerTransaction({
    fee: '10000000',
    type: 1003,
    args: [
      reveal.mid,
      reveal.choice
    ]
  }, secret)
  return await PIFY(submitInnerTransaction)(trs)
}

async function createAppealAsync(appeal, secret) {
  let trs = AschJS.dapp.createInnerTransaction({
    fee: '10000000',
    type: 1004,
    args: [
      appeal.mid,
      appeal.content,
      appeal.amount
    ]
  }, secret)
  return await PIFY(submitInnerTransaction)(trs)
}

async function createVerdictAsync(verdict, secret) {
  let trs = AschJS.dapp.createInnerTransaction({
    fee: '10000000',
    type: 1005,
    args: [
      verdict.mid,
      verdict.choice,
      verdict.signatures
    ]
  }, secret)
  return await PIFY(submitInnerTransaction)(trs)
}

async function createCommentAsync(comment, secret) {
  let trs = AschJS.dapp.createInnerTransaction({
    fee: '10000000',
    type: 1006,
    args: [
      comment.mid,
      comment.content
    ]
  }, secret)
  return await PIFY(submitInnerTransaction)(trs)
}

function signBytes(bytes, secret) {
  let keys = AschJS.crypto.getKeys(secret)
  return AschJS.crypto.signBytes(bytes, keys)
}

function getPublicKey(secret) {
  return AschJS.crypto.getKeys(secret).publicKey
}

function getPublicKey(secret) {
  return AschJS.crypto.getKeys(secret).publicKey
}
//  var transaction =  AschJS.signature.createSignature ( 'someone manual strong movie roof episode eight spatial brown soldier soup motor' , 'charry123' )       
//  console.log(JSON.stringify(transaction))  
// { " Type " : . 1 , 
//   " AMOUNT " : 0 , 
//   " Fee " : 500 million , 
//   " recipientId " : null , 
//   " senderPublicKey " : " 3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f " , 
//   " timestamp " : 5328943 , 
//   " Asset " : { 
//     " Signature " :{ 
//       " publicKey" : " 27116db89cb5a8c02fb559712e0eabdc298480d3c79a089b803e35bc5ef7bb7b " }}, 
//       " Signature " : " 71ef98b1600f22f3b18cfcf17599db3c40727c230db817f610e86454b62df4fb830211737ff0c03c6a61ecfd4a9fcb68a30b2874060bb33b87766acf800e820a " ,
//       " ID " : " 15605591820551652547 " }   

// // The transaction data generated above is provided by a secondary password submitted to the post Server acchain 
// curl - H  " the Content-the Type: file application / JSON "  - H  " Magic: 8e9b66ed "  - H  " Version: '' "  - K - X-  POST  - d '{"transaction":{"type":1,"amount":0,"fee":500000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5328943,"asset":{" Signature ": {" publicKey ":" 27116db89cb5a8c02fb559712e0eabdc298480d3c79a089b803e35bc5ef7bb7b "}}," Signature ":" 71ef98b1600f22f3b18cfcf17599db3c40727c230db817f610e86454b62df4fb830211737ff0c03c6a61ecfd4a9fcb68a30b2874060bb33b87766acf800e820a "," ID ":" 15605591820551652547 "}} ' HTTPS : // testnet.acchain.org/peer/transactions   


module.exports = {
  dapp: dapp,
  PIFY: PIFY,
  baseApiGetAsync: PIFY(baseApiGet),
  dappApiGetAsync: PIFY(dappApiGet),
  initAsync: PIFY(init),
  onNewBlockAsync: onNewBlockAsync,
  getRandomAccount: getRandomAccount,
  genesisAccount: genesisAccount,
  giveMoneyAndWaitAsync: giveMoneyAndWaitAsync,
  submitInnerTransactionAsync: PIFY(submitInnerTransaction),
  sleepAsync: PIFY(sleep),
  createMarketAsync: createMarketAsync,
  createTradeAsync: createTradeAsync,
  createSettleAsync: createSettleAsync,
  createRevealAsync: createRevealAsync,
  createAppealAsync: createAppealAsync,
  createVerdictAsync: createVerdictAsync,
  createCommentAsync: createCommentAsync,
  signBytes: signBytes,
  getPublicKey: getPublicKey
}