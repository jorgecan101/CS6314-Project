var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
// var monk = require('monk');
// var db = monk('localhost:27017/library');
// var libraryDB = db.get('books');
// var usersDB = db.get('users'); // TODO: Create users database
mongoose.connect('mongodb://localhost:27017/library');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function callback() {
  console.log("Connnected to db");
});
var passport = require('passport');
var Account = require('../models/account');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/home');
});

/* GET login page */
router.get('/login', function(req, res, next) {
  res.render('login'); // This should render the ejs file for login page
});

router.post('/login', passport.authenticate('local'), function(req,res){
  if(err) {
    // console.log(req + "request does not go through");
    res.redirect('/login');
    throw err;
  }
  res.redirect('/home');
});

/* GET sign-up page */
router.get('/register', function(req, res, next) {
  res.render('register'); // This should render the ejs file for register page
});

/* POST send new user data to database and redirect to sign in page */
router.post('/register', function(req,res) {
  account = new Account({email: req.body.email, name: req.body.name});
  Account.register(account, req.body.password, function(err, account){
    if(err) {
      console.log("hello"); // Testing
      return res.render('register', {account : account});
    }
    res.redirect('/login');
//    passport.authenticate('local')(req,res, function(){
//      res.redirect('/login');
//    })
  });
});

/* GET home page */
router.get('/home', function(req, res, next) {
  res.render('homepage', {user: req.user}); // This should render the ejs file for homepage
});

// TODO: Add more views that we may be able to use


module.exports = router;


