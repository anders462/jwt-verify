# JWT Authentication module


How to use:
var app = express(); // create express app instance

//initiate auth module
var auth = require('./auth_mod')(app);


// set config values
auth.config({});//{} sets default values



Default values!
login = options.login || '/api/login';
register = '/api/register';
update = '/api/update';
secret =  'verysecret';
tokenName = 'x-access-token';
model = "./models/user";

or set to custom values:

Example custom values
auth.config({
login: '/my_login_route',
register: '/my_register_route',
update: '/my_update_route',
secret: process.env.TOKEN_SECRET,
tokenName: 'my_token_name,
model: "./my_model_url"
});

Initiate routes:

auth.register();
auth.login();
auth.update();
