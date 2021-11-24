var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function callback() {
  console.log("Connnected to db");
});
var passport = require('passport');
var Account = require('../models/account');
var Book = require('../models/books');
var Cart = require("../models/cart");
//var accountID = req.Account.

/* GET redirect to home page. */
router.get('/', function(req, res) {
  res.redirect('/home');
});

/* GET home page */
router.get('/home', function(req, res) {
  res.render('homepage', {user: req.user});
});

/* GET login page */
router.get('/login', function(req, res) {
  res.render('login');
});

/* POST user logs in */
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info){
    if(err){
      return next(err);
    }
    if(!user){
      return console.log('authentication failed');
    }
    req.login(user, loginErr => {
      if(loginErr){
        return next(loginErr);
      }
      res.redirect('/home')
      return console.log('authentication succeed');
    });
  })(req,res,next);
  console.log(req.body.email);
});

/* GET sign-up page */
router.get('/register', function(req, res) {
  res.render('register');
});

//retrieve all accounts
router.get('/api/accounts', function(req,res){
  Account.find({}, function(err,accounts){
    if(err) throw err;
    res.json(accounts);
  })
});

/* POST send new user data to database and redirect to sign in page */
router.post('/register', function(req,res) {
  const account = new Account({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username
  });
  Account.findOne({email: req.body.email}, function(err, result){
    if(err) console.log(err);
    if(result){
      res.json({status: "Failure", message: "Email already existed"});
    }
    else{
      Account.register(account, req.body.password, function(err, account){
        if(err) {
          // TODO: Add something to tell user why they couldn't log in (i.e. User with account already exists, etc..)
          return res.render('register', {account : account});
        }
        passport.authenticate('local')(req,res, function() { 
          //res.redirect('/login');
          res.json({status: "Success", redirect: '/login'});
        });
      });
    }
  });
});

/* GET Logout Page */
router.get('/logout', function(req, res) {
// TODO: Get user to logout successfully. So it should not allow user to update anything for specific user since they logged out.
// So something like set user to none? idk tbh
  res.redirect('/home');
});

/* GET catalog page */
router.get('/catalog', function(req, res) {

  Book.find({}, function(err, books) {
    if (err) throw err;
    res.render('catalog', { results : books});
  });
});

/* GET cart page */
router.get('/cart', function(req, res) {
  
  res.render('cart');
});

module.exports = router;


