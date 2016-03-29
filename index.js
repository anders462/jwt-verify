var tokenVerify = require('./token_verify')(), //verifies token
    bcrypt = require('bcrypt'), //password hashing
    jwt = require('jsonwebtoken'), // used to create, assign and verify tokens
    express = require('express');




var login, register, update,secret,tokenName,User;

var router = express.Router();

function config(options, user){
  login =  options.login || '/api/login';
  register = options.register || '/api/register';
  update = options.update || '/api/update';
  secret = options.secret || 'verysecret';
  tokenName = options.tokenName || "x-access-token";
  User = user;
  tokenVerify.config({
    secret: secret,
    tokenName: tokenName
  })
  // console.log("before",secret)
}

function routerAuth(){
  router.route(login)
    .post(function(req, res) {

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



  //REGISTER NEW USER
  router.route(register)
    .post(function(req, res) {

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


    //UPDATE PASSWORD
    router.route(update)
      .put(tokenVerify.verify,function(req,res){

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

    return router;
  };

  module.exports.config = config;
  module.exports.routerAuth = routerAuth;
