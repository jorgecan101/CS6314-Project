var express = require('express');
var router = express.Router();
/*
var mongoose = require('mongoose');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function callback() {
  console.log("Connnected to db");
});
*/
var monk = require("monk");
var db = monk("localhost:27017/library");

var passport = require('passport');
var Account = require('../models/account');
var Book = require('../models/books');
//Cart Schema
var Cart = require("../models/cart");
//var accountID = req.Account._id;

var methodOverride = require('method-override');
// override with POST having ?_method=DELETE or ?_method=PATCH
router.use(methodOverride('_method'));

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
  res.render('login', {user: req.user});
});

/* POST user logs in */
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info){
    if(err){
      return next(err);
    }
    if(!user){
      return console.log(info);
    }
    req.login(user, loginErr => {
      if(loginErr){
        return next(loginErr);
      }
      res.json({status: "Success", redirect: '/home'});
      return console.log('authentication succeed');
    });
  })(req,res,next);
  console.log(req.body.email);
});

/* GET sign-up page */
router.get('/register', function(req, res) {
  res.render('register', {user: req.user});
});

//GET retrieve all accounts
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
    username: req.body.username,
    isAdmin: false
  });
  Account.findOne({email: req.body.email}, function(err, result){
    if(err) console.log(err);
    if(result){
      res.json({status: "Failure", message: "Email already existed"});
    }
    else{
      Account.register(account, req.body.password, function(err, account){
        if(err) {
          return res.render('register', {account : account});
        }
        passport.authenticate('local')(req,res, function() { 
          res.json({status: "Success", redirect: '/login'});
        });
      });
    }
  });
});

/* GET Logout Page */
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/home');
});

/* GET catalog page */
router.get('/catalog', function(req, res) {
  var collection = db.get("books");
  var usertitle = req.query.title;
  var usergenre = req.query.genre;
  var regTitle = new RegExp(usertitle, 'i');
  var regGenre = new RegExp(usergenre, 'i');
  // No filters applied
  if ((!usertitle && !usergenre) || (usertitle == "" && usergenre == "all")) {
    collection.find({}, function (err, books) {
      if (err) throw err;
      res.render("catalog", {books, user: req.user});
    }); 
  }
  // Filter only based on title
  else if (usertitle != "" && usergenre == "all") {
    collection.find({title : regTitle}, function(err, books) { 
      if (err) throw err;
       res.render("catalog", {books, user: req.user});
    });
  }
  // Filter based on both title and genre
  else if (usertitle != "" && usergenre != "all") {
    collection.find({title : regTitle, genre: regGenre}, function(err, books) { 
      if (err) throw err;
       res.render("catalog", {books, user: req.user});
    });
  }
  // Filter based on only genre
  else if (usertitle == "" && usergenre != "all") {
    collection.find({genre: regGenre}, function(err, books) { 
      if (err) throw err;
       res.render("catalog", {books, user: req.user});
    });
  }
});

/* GET book/id for getting to page about specific book */
router.get('/book/:id', function(req, res) {
  Book.findOne({_id : req.params.id}, function(err, book) {
    if (err) throw err;
    res.render('show', {book : book, user: req.user});
  });
});

/* POST book/id , for adding book to users cart */
router.post('/book/:id', function(req, res) {
  //TODO: Not sure where the right endpoint is for posting 
  const addToCart = new Cart({ 
  
    // This is completly wrong!!!!!  
    
    accountId : req.body._id,
    cartContents : req.body.book,
    date : req.body.date
  }, function(err, book) {
    if (err) throw err;
    res.redirect('/catalog');
  });
});

/* cart functionality */

//add to cart
router.post("/:id/cart", function(req, res){

  var books = db.get("books");
  var cart = db.get("cart");

  books.findOne({_id: req.body.like }, function(err, book){
    if (err) throw err;
    var url = "/cart/" + req.body.like;

    cart.collection.findOne(
      {
        userid: req.user._id, 
        cartContents: book,
      },
      function(err, result){
        if (err) throw err;
        if(result){
          console.log("duplicate book spotted");
          res.redirect(url);
        }else{
          cart.insert(
            {
              cartContents: book, 
              

            }
          )
        }
      }
    )
  })

  res.render('cart');
  
  

  

});
router.get('/cart', function(req, res) {
  Cart.find({}, function(err, cartbook){
    if (err) throw err;
    res.render('cart', {cartbook});
  });
});





/*ADMIN routes*/
//GET show edit form 
router.get('/book/:id/edit', function(req, res){
  var collection = db.get("books");
  collection.findOne({_id: req.params.id}, function(err, book){
      if(err) console.log(err);
      res.render('admin/edit', {book: book, user: req.user});
  });
});

//update an existing book
router.patch('/book/:id', function(req, res){
  var collection = db.get("books");
  collection.update({_id: req.params.id},
      { $set: {
          title: req.body.title,
          author: req.body.author,
          publisher: req.body.publisher,
          description: req.body.desc,
          genre: req.body.genre,
          image: req.body.image,
          isbn: req.body.isbn
  
      }}, function(err, book){
          if(err) console.log(err);
          //if updated is successful, redirect to /books
          res.redirect('/catalog');
      });
});

//show add new form
router.get('/catalog/new', function(req, res) {
  res.render('admin/new', {user: req.user});
});

// POST create a book
router.post('/catalog', function(req, res){
  var collection = db.get("books");
  collection.insert({
      title: req.body.title,
      author: req.body.author,
      publisher: req.body.publisher,
      description: req.body.desc,
      genre: req.body.genre,
      image: req.body.image,
      isbn: req.body.isbn
  }, function(err, book){
      if(err) console.log(err);
      res.redirect('/catalog');
  });
});

module.exports = router;


