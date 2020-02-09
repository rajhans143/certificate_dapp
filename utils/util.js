var crypto = require("crypto");
var sodium = require('sodium').api;

module.exports = {
    
    MakeKeypair: function (hash) {
        var keypair = sodium.crypto_sign_seed_keypair(hash);
        return {
          publicKey: keypair.publicKey,
          privateKey: keypair.secretKey
        };
    },
    
    Sign: function (hash, keypair) {
        return sodium.crypto_sign_detached(hash, Buffer.from(keypair.privateKey, 'hex'));
    },
    
    Verify: function (hash, signature, publicKey) {
        //var signatureBuffer = new Buffer(signature);
        //var publicKeyBuffer = new Buffer(publicKey);
        //return sodium.crypto_sign_verify_detached(signatureBuffer, hash, publicKeyBuffer);
        return sodium.crypto_sign_verify_detached(signature, hash, publicKey);
    },

    getHash: function(data){
        // let buffer = new ByteBuffer(1000, true);
        //     // for(x in data){
        //     //     buffer.writeString(data[x]);
        //     // }

        // buffer.writeCString(data); 
    
            return  crypto.createHash('sha256').update(data).digest(); //buffer.toBuffer()
    },
    
    getSignature: function(data, secret){
        var datahash = this.getHash(data);
        return this.getSignatureByHash(datahash, secret);
    },

    getSignatureByHash: function(datahash, secret){
        var secrethash = crypto.createHash('sha256').update(secret, 'utf8').digest();
        var Keypair = this.MakeKeypair(secrethash);
        comsign = this.Sign(datahash,Keypair);
        //console.log("companysign :"+comsign);
        return comsign;
    },

    getPublicKey: function(secret){
        var secrethash = crypto.createHash('sha256').update(secret, 'utf8').digest();
        var Keypair = this.MakeKeypair(secrethash);
        return Keypair.publicKey.toString('hex');
    },

    contractArgs: function(obj){
        var s = "[";
        for(i in obj){
          s += "\"" + obj[i] + "\"" + ",";
        }
        s = s.substring(0,s.length - 1)
        s += "]";
        return s;
      }
}