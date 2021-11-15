var express = require('express');
var router = express.Router();
var monk = require('monk');
var db = monk('localhost:27017/library');
var libraryDB = db.get('books');
var usersDB = db.get('users'); // TODO: Create users database
var passport = require('passport');
var Account = require('../models/account');

/* GET home page. */
router.get('/', function(req, res, next) {
  // Current idea is that we make the user sign-up/login first before being able to see homepage.
  // TODO: May be a problem if user is already logged in and they want go to homepage, where homepage will redirect them to login
  res.redirect('/login');
});

/* GET login page */
router.get('/login', function(req, res, next) {
  res.render('login'); // This should render the ejs file for login page
});

router.post('/login', passport.authenticate('local'), function(req,res){
  res.redirect('/home');
});

/* GET sign-up page */
router.get('/register', function(req, res, next) {
  res.render('register'); // This should render the ejs file for register page
});

router.post('/register', function(req,res){
  Account.register(new Account({email: req.body.email}), req.body.password, function(err, account){
    if(err){
      return res.render('register', {account: account});
    }
    passport.authenticate('local')(req,res, function(){
      res.redirect('/');
    })
  });
});

/* GET home page */
router.get('/home', function(req, res, next) {
  res.render('homepage'); // This should render the ejs file for homepage
});

// TODO: Add more views that we may be able to use


module.exports = router;


