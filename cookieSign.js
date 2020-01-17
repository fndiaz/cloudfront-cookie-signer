let AWS = require('aws-sdk');
var fs = require('fs');
var bodyParser = require("body-parser");



exports.getSignedCookie = function(req, res) {
  let keyPairId = "ID-KEYPAIR";
  let privateKey = fs.readFileSync("file.pem"); 
  
  let cfUrl = "*.domain.com.br";
  //let expiry = Math.round((new Date()).getTime() / 1000) + 3600;
  let expiry = Math.floor(Date.now() / 1000) + 60;
  
  
  let policy = {
    'Statement': [{
      'Resource': 'http*://' + cfUrl + '/*',
      'Condition': {
        'DateLessThan': {'AWS:EpochTime': expiry}
      }
    }]
  };
  
  let policyString = JSON.stringify(policy);
  
  let signer = new AWS.CloudFront.Signer(keyPairId, privateKey);

  var options = {url: "http://"+cfUrl, policy: policyString};

  signer.getSignedCookie(options, function(err, cookie) {
        if (err) {
            res.send(err);
        } else {

            console.log("cookies: ");
            console.log(cookie);
            console.log(expiry)
            res.cookie("CloudFront-Key-Pair-Id", cookie['CloudFront-Key-Pair-Id'], { path: '/', domain: '.domain.com.br'});
            res.cookie("CloudFront-Policy", cookie['CloudFront-Policy'], { path: '/', domain: '.domain.com.br'});
            res.cookie("CloudFront-Signature", cookie['CloudFront-Signature'], { path: '/', domain: '.domain.com.br'});
            res.send(cookie);
            
        }
  });
};
