var tokenVerify = require('./token_verify')(), //verifies token
    bcrypt = require('bcrypt'), //password hashing
    jwt = require('jsonwebtoken'); // used to create, assign and verify tokens


module.exports = function(app){

var login, register, update, secret, tokenName, model, User;

module = {};

module.config = function(options){
  login = options.login || '/api/login';
  register = options.register || '/api/register';
  update = options.update || '/api/update';
  secret = options.secret || 'verysecret';
  tokenName = options.tokenName || "x-access-token";
  model = options.model || "./models/user";

  User = require(model);

  tokenVerify.config({
    secret: secret,
    tokenName: tokenName
  })
}



module.login = function(){

  //AUTHENTICATE USER
  app.post(login, function(req,res){

  //find user
  User.findOne({username: req.body.username}, function(err,user){
    if (err) {
      console.log("error db")
      res.status(500).json({success:false, message: "DB error"});
      throw err;
    }

    if (!user){
      res.status(401).json({success:false, message: "Authentication failed. User not found!"});
    } else if (user) {

      //check if password matches
      bcrypt.compare(req.body.password, user.password, function(err, auth) {
        if(err) {
          res.status(500).json({success:false, message: "DB error"});
          throw err;
        }
        if (!auth){
          res.status(401).json({success: false, message: "Authentication failed. Wrong password!"});
        } else {
          // if user is found and password is correct
          // create token
          user.password="fake password";
          jwt.sign(user, secret,
          {expiresIn: 86400}, function(token){
            // return the information including token as JSON
            console.log(token);
            res.status(200).json({success: true, message: 'Token sent', token: token, user: user.username });
          });
        }

      }); //end bcrypt callback
     }

    }); //end MongoDB callback
  });

}



module.register = function(){

//REGISTER NEW USER
app.post(register, function(req, res) {

      User.findOne({username: req.body.username}, function(err,user){
        if(err) throw err;
        // check if username is unique
        if (!user){
        //encrypt password
          bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
              if (err) throw err;
            // create new user
              var newUser = new User({
                username: req.body.username,
                password: hash,
                admin: false
              });
              //save user to db
              newUser.save(function(err) {
                if (err) throw err;
                console.log('User saved successfully');
                res.status(200).json({ success: true, message: "New user created and saved" });

              });
        });
      });

       } else {
         res.status(403).json({ success: false, message: "Username already exists" });
       }
     });
});

};

module.update = function(){
  //UPDATE PASSWORD
  app.put(update, tokenVerify.verify,function(req,res){

    User.findOne({username: req.decoded._doc.username},{password:1, _id:0}, function(err,user){
      if (err) throw err;
      //check if password matches
      bcrypt.compare(req.body.oldPassword, user.password, function(err, auth) {
        if (err) throw err;
          //if not authorized
          if (!auth){
            res.status(401).json({success: false, message: "Authentication failed. Wrong password!"});
          } else {
            //encrypt new password
            bcrypt.genSalt(10, function(err, salt) {
              bcrypt.hash(req.body.newPassword, salt, function(err, hash) {
                if (err) throw err;

              //update oldPassword hash with newPassword hash
              User.findOneAndUpdate({username: req.decoded._doc.username}, {password: hash}, function(err,user) {
                  if (err) throw err;
                  res.status(200).json({ success: true, message: "New password saved" });

                });
             });
            });
          }
       });
    });

  });

};

  return module;
}
