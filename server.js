'use strict'
var express = require('express'), // express lightweight node framework
    mongoose = require('mongoose'), // mongoose abstraction of mongodb
    morgan = require('morgan'), // morgan as logger
    bodyParser = require('body-parser'), // enabling parsing of body params
    dotenv = require('dotenv').config({silent: true}); // make .env available to process.env

    var app = express(); // create express app instance
    var auth = require('./auth_mod')(app); //initiate auth module
    auth.config({});//default values

    app.set('port', 4003);   // set port for server

     //-----------------------------------
     // -- connect to mongo database -----
     //-----------------------------------
    mongoose.connect("mongodb://localhost:27017/test"); //change when running local db
  //  mongoose.connect(process.env.MONGOLAB_URI);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Database failed to connect!'));
    db.once('open', function() {
      console.log('MongoDB successfully connected on port 27017.');
    });

    //add middleware parser for urlencoded body data POST and URL JSon params
    app.use(bodyParser.urlencoded({extended:false})); //extended = false option => use querystring library
    app.use(bodyParser.json());
    //add middleware for static route
    app.use(express.static('public')); //mount stattic route public
    app.use(morgan('dev')); //add morgan middleware logger

    auth.login();
    auth.register();
    auth.update();


    // Start the server
    var server = app.listen(app.get('port'), function(){
      console.log("server is running on port " + app.get('port') + "...");
    });

    module.exports = server;
