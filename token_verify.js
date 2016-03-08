(function(){

'use strict'

var    jwt = require('jsonwebtoken'); // used to create, assign and verify tokens

module.exports =   function(){

module = {};

var tokenName, secret;

module.config = function(options){
  tokenName = options.tokenName;
  secret = options.secret;
}

module.verify = function(req,res,next){
  console.log(tokenName);
    //check header or url parameters or post parameters for token
    var token = req.body[tokenName] || req.query[tokenName]|| req.headers[tokenName];
    //decode token
    if (token) {
      //verify secret and checks exp
      jwt.verify(token, secret, function(err,decoded){
        if (err) {
          res.status(401).json({success: false, message: "Failed to authenticate token"});
        } else {
          //if everthing is good, safe to request for use in other routes

          req.decoded = decoded;
          next();
        }
      });
    } else {
      // if there is no token, return error
       res.status(401).send({success: false, message: 'No token provided'});
    }

  };

  return module;

};

})();
