# Node.js Module for JWT Authentication Module


## Summary
Simple Authentication module using JWT Token and hash passwords with bcrypt.
Creates a middleware with '/login', '/register' and '/update' routes.

## Requirements
### Module assumes your using:
1. Node.js/Express.js
2. MongoDB
3. Defined a Mongoose user models seen below

```
// model/users.js need to have "username" and "password" as properties
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    username: String,
    password: String,
});
module.exports = mongoose.model('User',User);

```

##Installation
```
npm install auth-module-jwt --save

```

```
// create a express app
var app = express(); // create express app instance
var User = require("./models/user"); //your User model

//initiate auth module
var auth = require('./auth-module-jwt');

//set config values
auth.config({},User); //{} sets default values and pass in User Obj
```

###Default values!
```
login = '/api/login';
register = '/api/register';
update = '/api/update';
secret =  'verysecret';
tokenName = 'x-access-token';

```

###or set to custom values:

```
//example how to set custom values
auth.config({
login: '/my_login_route',
register: '/my_register_route',
update: '/my_update_route',
secret: process.env.TOKEN_SECRET,
tokenName: 'my_token_name,
},User);

```

###Mount the middleware and your done!:
```
app.use('/auth',auth.authRouter());

```

###Client side configuration

```
//send username and password in as body JSON objects
{"username":"myusername","password":"mypassword"}

//Set token in header
tokenName: xxxxx.yyyyy.zzzzz

//Set token in body
{tokenName: xxxxx.yyyyy.zzzzz }

//Set token as url query parameter
/api/register/?tokenName=xxxxx.yyyyy.zzzzz

```


###Response messages:
```
//Login success
{success: true, message: 'Token sent', token: token, user: user.username }

//Login failure
{success:false, message: "DB error"};
{success:false, message: "Authentication failed. User not found!"};
{success:false, message: "Authentication failed. Wrong password!"};


//Register success
{ success: true, message: "New user created and saved" }

//Register failure
{ success: false, message: "Username already exists" };


//Update password success
{ success: true, message: "New password saved" }

//Update password failure
{success:false, message: "Authentication failed. Wrong password!"};
{success: false, message: "Failed to authenticate token"}
{success: false, message: 'No token provided'}
