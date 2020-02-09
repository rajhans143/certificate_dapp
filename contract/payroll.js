var ByteBuffer = require("bytebuffer");
var util = require("../utils/util.js");
var api = require("../utils/api");
var SwaggerCall = require("../utils/SwaggerCall");
var SuperDappCall = require("../utils/SuperDappCall")
var TokenCall = require("../utils/TokenCall");
var register = require("../interface/register");
var registrations = require("../interface/registrations");
var auth = require("../interface/authController");
var mailCall = require("../utils/mailCall");
var logger = require("../utils/logger");
var locker = require("../utils/locker");


module.exports = {

    issuePaySlip: async function(toaddr, type, pid, email, empid, name, employer, month, year, designation, bank, accountNumber, pan, basicPay, hra, lta, ma, providentFund, professionalTax, grossSalary, totalDeductions, netSalary, issuerid, timestamp){

        logger.info("Entered issuePaySlip contract");
        //app.sdb.lock('payroll.issuePaySlip@'+empid);
        app.sdb.update('issue', {transactionId: this.trs.id}, {pid: pid});

    },

    authorize: async function(iid, secret, authid, dappid){
        app.sdb.lock("authorize@" + iid);
        logger.error("Entered authorize contract - Deprecated");
        // Check Authorizer
        var publickey = util.getPublicKey(secret);
        var checkauth = await app.model.Authorizer.findOne({
            condition:{
                id: authid  
            }
        });
        if(!checkauth) return "Invalid Authorizer";

        if(checkauth.publickey === '-'){
            app.sdb.update('authorizer', {publickey: publickey}, {id: authid});
        }

        // // Check Authorization table
        // var check = await app.model.Ps.exists({
        //     iid: iid,
        //     aid: checkauth.id
        // });
        // if(!check) return "Signature not pending";

        // Fetch the Unconfirmed issue

        var check = await app.model.Cs.findOne({
            condition: {
                upid: iid,
                aid: authid
            }
        });
        if(check) return "Already authorized";

        var uissue = await app.model.Ui.findOne({
            condition: {
                id: iid
            }
        });
        if(!uissue) return "Invalid Unconfirmed Issue";

        // Fetch the unconfirmed Payslip data
        var payslip = await app.model.Ucps.findOne({
            condition: {
                id: uissue.id
            }
        });
        console.log("Payslip when fetched: " + JSON.stringify(payslip));

        // Check hashes
        var hash = util.getHash(JSON.stringify(payslip));
        var base64hash = hash.toString('base64');
        console.log("Payslip obj: " + JSON.stringify(payslip));
        console.log("hashed: " + base64hash);
        console.log("recieved: " + uissue.hash);
        if(uissue.hash !== base64hash) return "Issuer donga";

        // Sign the hash
        var base64sign = (util.getSignatureByHash(hash, secret)).toString('base64');

        // Get counts
        var authcount = await app.model.Authorizer.findAll({
            fields: ['id']
        });
        var confirmedsigns = await app.model.Cs.findAll({
            condition: {
                upid: iid
            }
        });

        if(authcount.length - 1 === confirmedsigns.length){
            app.sdb.create('mps', payslip);
            uissue.timestamp = new Date().getTime();
            app.sdb.create('mi', uissue);

            for(let i=0; i<confirmedsigns.length; i++){
                app.sdb.create('authsign', {
                    mid: iid,
                    aid: confirmedsigns[i].aid,
                    sign: confirmedsigns[i].sign
                });
            }
            app.sdb.create('authsign', {
                mid: iid,
                aid: checkauth.id,
                sign: base64sign
            });

            // Deleting unconfirmed tables
            app.sdb.del('ucps', {
                id: iid
            });
            app.sdb.del('ui', {
                id: iid
            });
            app.sdb.del('cs',{
                upid: iid
            });

        }
        else{
            app.sdb.create('cs', {
                upid: iid,
                aid: checkauth.id,
                sign: base64sign
            });
        }
    },

    verify: async function(obj){
        
        logger.error("Entered verify contract - Deprecated")
        //app.logger.debug(objtext);
        //var obj = JSON.parse(objtext);
        var objtext = JSON.stringify(obj);
        console.log("objtext " + objtext);
        var hash = util.getHash(objtext);
        console.log("Verifier: " + hash);
        //var hash = util.getHash(objtext);



        var base64hash = hash.toString('base64');
        console.log("Verifier base64 hash: " + base64hash)

        var result = await app.model.Issue.findOne({
            condition: {hash: base64hash}
        });

        if(!result) return "Hash not found";

        //var result2 = await app.model.Employer.findOne({publickey: result.publickey});

        console.log("Verifier base64 sign: " + result.sign);
        console.log("Verifier base64 publickey: " + result.publickey);

        var sign = new Buffer(result.sign, 'base64');
        var publickey = new Buffer(result.publickey, 'hex');  
        console.log("Verifier sign: " + sign);
        console.log("Verifier publickey: " + publickey);


        if(!util.Verify(hash, sign, publickey) /*&& result2.name === obj.employer*/) return "Wrong Employer Signature";

    },

    registerEmployee: async function(countryCode, email, lastName, name, uuid, designation, bank, accountNumber, pan, salary, dappid){
        app.sdb.lock("registerEmployee@" + uuid);
        logger.error("Entered registerEmployee - Deprecated");
        var result = await app.model.Employee.exists({
            email: email
        });
        if(result) return "Employee already registered";

        // Checking if the employee's registration is pending
        result = await app.model.Pendingemp.exists({
            email:email
        });
        if(result) return "Employee didn't share his Wallet Address yet";

        var request = {
            query: {
                email: email
            }
        }
        var response = await registrations.exists(request, 0);
        

        if(response.isSuccess == false) {
            var token = await register.getToken(0,0);

            console.log(token);

            if(token === "0" || token ==="-1") return "Error in retrieving token";
            
            console.log(email)

            console.log("Passed email already exists or not");

            function makePassword() {
                var text = "";
                var caps = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                var smalls = "abcdefghijklmnopqrstuvwxyz";
                var symbols = "!@#$%^&*";
                var numbers = "1234567890";
            
                for (var i = 0; i < 3; i++){
                text += caps.charAt(Math.floor(Math.random() * caps.length));
                text += smalls.charAt(Math.floor(Math.random() * smalls.length));
                text += symbols.charAt(Math.floor(Math.random() * symbols.length));
                text += numbers.charAt(Math.floor(Math.random() * numbers.length));
                }
                return text;
            }

            var password = makePassword();        


            var options = {
                countryCode: countryCode,
                email: email,
                lastName: lastName,
                name: name,
                password: password,
                uuid: uuid
            }

            console.log("About to call registration call with parameters: " + JSON.stringify(options));

            var response = await SwaggerCall.call('POST', '/api/v1/registration/verifier', options);

            console.log("Verifier Registration response is complete with response: " + JSON.stringify(response));

            if(!response) return "No response from verifier call";
            if(!response.isSuccess) return JSON.stringify(response);

            var data = response.data;

            var wallet = JSON.parse(data.wallet);
            wallet.loginPassword = password;

            var opt = {
                roleId: '3',
                userId: data.uid
            }

            console.log("About to make change role call");

            var resp = await TokenCall.call('PATCH', '/api/v1/users/role', opt, token);

            console.log("Change role call made with response: " + JSON.stringify(resp));

            if(!resp) return "No response from change role call";
            if(!resp.isSuccess) return JSON.stringify(resp);

            var creat = {
                email: email,
                empID: uuid,
                name: name + lastName,
                designation: designation,
                bank: bank,
                accountNumber: accountNumber,
                pan: pan,
                salary: salary,
                walletAddress: wallet.address
            }

            console.log("About to make a row");

            app.sdb.create('employee', creat);

            var mapEntryObj = {
                address: wallet.address,
                dappid: dappid
            }
            var mapcall = await SuperDappCall.call('POST', '/mapAddress', mapEntryObj);
            console.log(JSON.stringify(mapcall));

            var mailBody = {
                mailType: "sendRegistered",
                mailOptions: {
                    to: [creat.email],
                    empname: creat.name,
                    wallet: wallet
                }
            }
            mailCall.call("POST", "", mailBody, 0);
        }
            
        else{
            var jwtToken = auth.getJwt(email);
            var crea = {
                email: email,
                empID: uuid,
                name: name + lastName,
                designation: designation,
                bank: bank,
                accountNumber: accountNumber,
                pan: pan,
                salary: salary,
                token: jwtToken
            }
            app.sdb.create("pendingemp", crea);
            console.log("Asking address");

            var mailBody = {
                mailType: "sendAddressQuery",
                mailOptions: {
                    to: [crea.email],
                    token: jwtToken,
                    dappid: dappid
                }
            }
            mailCall.call("POST", "", mailBody, 0);
        }
    },

    registerUser: async function(email, designation, countryId, countryCode, name, type, role, dappid){
        await locker("registerUser@" + role);

        logger.info("Entered registerUser with email: " + email + " and role: " + role + "and dappid: " + dappid);
        console.log("Entered Register User");

        switch(role){
            case "issuer": 
                result = await app.model.Issuer.exists({
                    email: email
                });
                break;

            case "authorizer":
                result = await app.model.Authorizer.exists({
                    email: email
                });
                break;

            default: 
                    logger.error("Invalid role");
                    return "Invalid role";
        }

        if(result){
            logger.error("User already registered");
            return "User already registered"
        }

        var request = {
            query: {
                email: email
            }
        }
        var response = await registrations.exists(request, 0);

        function makePassword() {
            var text = "";
            var caps = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var smalls = "abcdefghijklmnopqrstuvwxyz";
            var symbols = "!@$";
            var numbers = "1234567890";
        
            for (var i = 0; i < 3; i++){
            text += caps.charAt(Math.floor(Math.random() * caps.length));
            text += smalls.charAt(Math.floor(Math.random() * smalls.length));
            text += symbols.charAt(Math.floor(Math.random() * symbols.length));
            text += numbers.charAt(Math.floor(Math.random() * numbers.length));
            }
            return text;
        }

        var password = makePassword();        

        if(!response.isSuccess){
            var req = {
                query: {
                    countryId:countryId,
                    countryCode:countryCode,
                    email:email,
                    name:name,
                    password:password,
                    type:type
                }
            }
            var resultt = await registrations.signup(req, 0);
            if(resultt !== "success") return {
                message: JSON.stringify(resultt),
                isSuccess: false
            }

            var wallet = {
                password: password
            }
    
            var mailBody = {
                mailType: "sendRegistered",
                mailOptions: {
                    to: [email],
                    empname: name,
                    wallet: wallet
                }
            }
            try{
            mailCall.call("POST", "", mailBody, 0);
            }catch(err){
                console.log("Mail error");
            }

            logger.info("Registered a new user");
        }
        
        var mapObj = {
            email: email,
            dappid: dappid,
            role: role
        }
        var mapcall = await SuperDappCall.call('POST', "/mapUser", mapObj);
        // Need some exception handling flow for the case when a email with a particular role is already registered on the dapp.
        switch(role){
            case "issuer": 
            //getting the last registered id of an issuer
                app.sdb.create('issuer', {
                    iid: app.autoID.increment('issuer_max_iid'),
                    publickey: "-",
                    email: email,
                    designation: designation,
                    timestamp: new Date().getTime()
                });
                logger.info("Created an issuer");
                break;
            case "authorizer":
                app.sdb.create('authorizer', {
                    aid: app.autoID.increment('authorizer_max_aid'),
                    publickey: "-",
                    email: email,
                    designation: designation,
                    timestamp: new Date().getTime()
                });
                logger.info("Created an authorizer");
                break;
            default: return "Invalid role"
        }

    }
}