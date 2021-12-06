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
// var Book = require('../models/books');
//Cart Schema
// var Cart = require("../models/cart");
//var Wishlist = require("../models/wishlist");
//var accountID = req.Account._id;
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');

var methodOverride = require('method-override');
const { on } = require('../models/account');
const { dirname } = require('path');
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
      res.json({status: "Failure", message: "Username or password is incorrect"});
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
      Account.findOne({username: req.body.username}, function(err, result){
        if(err) console.log(err);
        if(result){
          res.json({status: "Failure", message: "Username already existed"});
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
      })
    }
  });
});

/* GET Logout Page */
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/home');
});

/* GET catalog page */
//var persistantTitle;

router.get('/catalog', function(req, res) {
  var page = parseInt(req.query.page) || 1;
  var result = [];
  var length = 0;
  var collection = db.get("books");
  var usertitle = req.query.title;
  var usergenre = req.query.genre;
  // var persistantTitle = [usertitle];
  console.log("uTitle: " + usertitle + " uGenre: " + usergenre);

  var regTitle = new RegExp(usertitle, 'i');
  var regGenre = new RegExp(usergenre, 'i');
  // No filters applied
  if ((!usertitle && !usergenre) || (usertitle == "" && usergenre == "all")) {
    //if we are the admin, we should be able to see all books
    if (req.user && req.user.isAdmin) {
      collection.find({}, function (err, books) {
        if (err) throw err;
        result = [];
        length = books.length;
        for (var i = 8 * (page - 1); i < 8 * page; i++) {
          if (i < length) {
            result.push(books[i]);
          }
        }
        var maxPage = Math.ceil(length / 8);
        res.render("catalog", {books: result, 
          currentPage : page,
          numPages : maxPage,
          numRes : books.length,
          user: req.user});
      }); 
    }
    else {
      collection.find({ isDeleted : false }, function (err, books) {
        if (err) throw err;
        result = [];
        length = books.length;
        for (var i = 8 * (page - 1); i < 8 * page; i++) {
          if (i < length) {
            result.push(books[i]);
          }
        }
        var maxPage = Math.ceil(length / 8);
        res.render("catalog", {books: result, 
          currentPage : page,
          numPages : maxPage,
          numRes : books.length,
          user: req.user});
      });
    }
  }
  // Filter only based on title
  else if (usertitle != "" && usergenre == "all") {
    if (req.user && req.user.isAdmin) {
      collection.find({title : regTitle}, function(err, books) { 
        if (err) throw err;
        result = [];
        length = books.length;
        for (var i = 8 * (page - 1); i < 8 * page; i++) {
          if (i < length) {
            result.push(books[i]);
          }
        }
        var maxPage = Math.ceil(length / 8);
        res.render("catalog", {books: result, 
          currentPage : page,
          numPages : maxPage,
          numRes : books.length,
          user: req.user});
      });
    }
    else {
      collection.find({title : regTitle, isDeleted : false}, function(err, books) { 
        if (err) throw err;
        result = [];
        length = books.length;
        for (var i = 8 * (page - 1); i < 8 * page; i++) {
          if (i < length) {
            result.push(books[i]);
          }
        }
        var maxPage = Math.ceil(length / 8);
        res.render("catalog", {books: result, 
          currentPage : page,
          numPages : maxPage,
          numRes : books.length,
          user: req.user});
      });
    }
  }
  // Filter based on both title and genre
  else if (usertitle != "" && usergenre != "all") {
    if (req.user && req.user.isAdmin) {
      collection.find({title : regTitle, genre: regGenre}, function(err, books) { 
        if (err) throw err;
        result = [];
        length = books.length;
        for (var i = 8 * (page - 1); i < 8 * page; i++) {
          if (i < length) {
            result.push(books[i]);
          }
        }
        var maxPage = Math.ceil(length / 8);
        res.render("catalog", {books: result, 
          currentPage : page,
          numPages : maxPage,
          numRes : books.length,
          user: req.user});
      });
    }
    else {
      collection.find({title : regTitle, genre: regGenre, isDeleted : false}, function(err, books) { 
        if (err) throw err;
        result = [];
        length = books.length;
        for (var i = 8 * (page - 1); i < 8 * page; i++) {
          if (i < length) {
            result.push(books[i]);
          }
        }
        var maxPage = Math.ceil(length / 8);
        res.render("catalog", {books: result, 
          currentPage : page,
          numPages : maxPage,
          numRes : books.length,
          user: req.user});
      });
    }
  }
  // Filter based on only genre
  else if (usertitle == "" && usergenre != "all") {
    if (req.user && req.user.isAdmin) {
      collection.find({genre: regGenre}, function(err, books) { 
        if (err) throw err;
        result = [];
        length = books.length;
        for (var i = 8 * (page - 1); i < 8 * page; i++) {
          if (i < length) {
            result.push(books[i]);
          }
        }
        var maxPage = Math.ceil(length / 8);
        console.log("max pages: " + maxPage + " currentPage: " + page + " numberRes: " + books.length);
        res.render("catalog", {books: result, 
          currentPage : page,
          numPages : maxPage,
          numRes : books.length,
          user: req.user});
      });
    }
    else {
      collection.find({genre: regGenre, isDeleted : false}, function(err, books) { 
        if (err) throw err;
        result = [];
        length = books.length;
        for (var i = 8 * (page - 1); i < 8 * page; i++) {
          if (i < length) {
            result.push(books[i]);
          }
        }
        var maxPage = Math.ceil(length / 8);
        // console.log("max pages: " + maxPage + " currentPage: " + page + " numberRes: " + books.length);
        res.render("catalog", {books: result, 
          currentPage : page,
          numPages : maxPage,
          numRes : books.length,
          user: req.user});
      });
    }
  }
});

/* GET book/id for getting to page about specific book */
router.get('/book/:id', function(req, res) {
  var collection = db.get("books");
  collection.findOne({_id : req.params.id}, function(err, book) {
    if (err) throw err;
    res.render('show', {book : book, user: req.user});
  });
});

/* ADMIN routes */

// GET show edit form 
router.get('/book/:id/edit', function(req, res){
  var collection = db.get("books");
  collection.findOne({_id: req.params.id}, function(err, book){
      if(err) console.log(err);
      res.render('admin/edit', {book: book, user: req.user});
  });
});

// PUT update an existing book
router.put('/book/:id', function(req, res){
  var collection = db.get("books");
  var form = new formidable.IncomingForm();
  var image = "";
  form.parse(req, function(err, fields, files){
    //console.log(files);
    var str = fields.genre;
    var genre = new Array();
    genre = str.split(',');
    collection.findOne({_id: req.params.id }, function(err, book){
      if(err) throw err;
      if(files.image.originalFilename === ""){
        image = book.image;
      }
      else{
        var oldpath = files.image.filepath;
        var newpath = 'public/images/' + files.image.originalFilename;
        var rawData = fs.readFileSync(oldpath);
        fs.writeFile(newpath, rawData, function (err) {
          if (err) throw err;
        });
        image = files.image.originalFilename;
      }
      collection.findOneAndUpdate({_id: req.params.id}, {
        $set: {
          title: fields.title,
          author: fields.author,
          publisher: fields.publisher,
          description: fields.desc,
          genre: genre,
          inventory: parseInt(fields.inventory),
          image: image,
          isbn: fields.isbn,
        }
      }, function(err, book){
        if(err) console.log(err);
        res.redirect('/catalog');
      });
    });
  })
});

// GET show add new form
router.get('/catalog/new', function(req, res) {
  res.render('admin/new', {user: req.user});
});

// POST create a book
router.post('/catalog', function(req, res){
  var collection = db.get("books");
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files){
    //console.log(files);
    var str = fields.genre;
    var genre = new Array();
    genre = str.split(',');
    var oldpath = files.image.filepath;
		var newpath = 'public/images/' + files.image.originalFilename;
		var rawData = fs.readFileSync(oldpath);
    fs.writeFile(newpath, rawData, function (err) {
		  if (err) throw err;
		}); 
    collection.insert({
      title: fields.title,
      author: fields.author,
      publisher: fields.publisher,
      description: fields.desc,
      genre: genre,
      inventory: parseInt(fields.inventory),
      image: files.image.originalFilename,
      isbn: fields.isbn,
      isDeleted: false
  }, function(err, book){
      if(err) console.log(err);
      res.redirect('/catalog');
  });
  })
});

// soft DELETE route (so actually a POST request)
router.post('/book/:id/delete', function(req, res){
  var collection = db.get("books");
  collection.findOneAndUpdate({_id: req.params.id},
      { $set: {
          isDeleted : true,
      }}, function(err, book){
          if(err) console.log(err);
          //if "delete" is successful, redirect to /catalog
          res.redirect('/catalog');
      });
});

//recover a book
router.post('/book/:id/recover', function(req, res){
  var collection = db.get("books");
  collection.findOneAndUpdate({_id: req.params.id},
      { $set: {
          isDeleted : false,
      }}, function(err, book){
          if(err) console.log(err);
          //if "delete" is successful, redirect to /catalog
          res.redirect('/catalog');
      });
});

/* Wishlist functionalities*/

/* GET wishlist for particaular user */
router.get('/:id/wishlist', function(req, res) {
  var wl_collection = db.get("wishlists");
  Account.findById(req.params.id, function(err, user) {

    wl_collection.find({username : user.username}, function(err, wls) {
      res.render('wishlist', {user: user, wls : wls});
    })
  });
});

/* POST adding to partiular users wishlist */
router.post("/:id/wishlist", function(req, res){

  var books_collection = db.get("books");
  var wl_collection = db.get("wishlists");

  books_collection.findOne({_id: req.body.wish }, function(err, book){
    if (err) throw err;
    // var url = "/home/" + req.body.like;
    // var url = "/home";

    wl_collection.findOne(
      {
        userid: req.user._id, 
        bookObject: book,
      },
      function(err, result){
        if (err) throw err;
        if(result){
          console.log("duplicate book spotted");
          res.redirect('/home');
        }else{
          wl_collection.insert(
            {
              bookObject: book, 
              bookid: book._id,
              bookname : book.title, 
              userid: req.user._id, 
              username: req.user.username,
            }, 
            function (err, wishlist){
              if (err) throw err;
              res.redirect('/home');
            }
          );
        }
      }
    );
  });
});

/* Deleting a book from the wishlist */
router.delete("/:id/wishlist", function(req, res){
  var wl_collection = db.get("wishlists");
  var url = "/" + req.params.id + "/wishlist";
  console.log("username: " + req.body.wlusername + " || bookname: " + req.body.wlbookname);
  wl_collection.remove(
    { username: req.body.wlusername, bookname: req.body.wlbookname },
    function(err, wl){
      if (err) throw err;
      res.redirect(url);
    }
  );
});

/**** Shopping Cart */
router.get("/:id/cart", function(req, res){
  var collection = db.get("cart");
  Account.findById(req.params.id, function (err, user){
    if(err){
      res.redirect("/login");
    }
    collection.find({username: user.username}, function(err, items){
      if(err){
        res.redirect("/catalog");
      }
      res.render("cart", {user: user, items:items});
    })
  });
});

//add to cart
router.post("/:id/cart", function (req, res){
  var books_collection = db.get("books");
  var cart_collection = db.get("cart");
  books_collection.findOne({ _id: req.body.cart }, function (err, book){
    if(err) throw err;
    var url = "/book/" + book._id;
    cart_collection.findOne({ userid: req.user._id, bookObject: book}, function (err, result){
      if(err) throw err;
      if(result){
        var inventory = parseInt(book.inventory);
        var originalbookcount = parseInt(result.bookcount);
        var add = parseInt(req.body.quantity);
        cart_collection.findOneAndUpdate({ userid: req.user._id, bookObject: book},
          { $set: {
            bookcount: originalbookcount + add,
            isEnough: originalbookcount + add <= inventory,
          }},
          function(err, cartItem){
            if(err) throw err;
            res.redirect(url);
          }
        );
      } else{
        var inventory = parseInt(book.inventory);
        var bookcount = parseInt(req.body.quantity);
        cart_collection.insert(
          {
            bookObject: book,
            bookid: book._id,
            bookname: book.title,
            bookcount: bookcount,
            userid: req.user._id,
            username: req.user.username,
            isEnough: bookcount <= inventory,
          },
          function (err, cartItem){
            if(err) throw err;
            res.redirect(url);
          }
        );
      }
    });
  });
});

//Delete from cart
router.delete("/:id/cart/remove", function(req, res){
  var cart_collection = db.get("cart");
  var books_collection = db.get("books");
  var url = "/" + req.params.id + "/cart";
  var deduct = parseInt(req.body.removeQuantity);
  var query = {bookname: req.body.bookname, username: req.body.username};
  books_collection.findOne({title: req.body.bookname}, function(err, book){
    if(err) throw err;
    cart_collection.findOne(query, function (err, result){
      if(err) throw err;
      var inventory = parseInt(book.inventory);
      var originalbookcount = parseInt(result.bookcount);

      if(originalbookcount > deduct){
        cart_collection.findOneAndUpdate(query, {
          $set: {
            bookcount: originalbookcount - deduct,
            isEnough: originalbookcount - deduct <= inventory,
          },
        })
        .then((updateDoc) => { });
        res.redirect(url);
      } else{
        cart_collection.remove(query, function(err, ans){
          if(err) throw err;
          res.redirect(url);
        });
      }
    })
  })
});

//delete all from cart
router.delete("/:id/cart/removeAll", function(req, res){
  var cart_collection = db.get("cart");
  var url = "/" + req.params.id + "/cart";
  cart_collection.remove({bookname: req.body.bookname, username: req.body.username}, function(err, ans){
    if (err) throw err;
    res.redirect(url);
  });
});

// add more to cart
router.post("/:id/cart/add", function(req, res){
  var cart_collection = db.get("cart");
  var books_collection = db.get("books");
  var url = "/" + req.params.id + "/cart";
  //var url = "/catalog"; //reroute to catalog page for now
  var add = parseInt(req.body.addQuantity);
  var query = {bookname: req.body.bookname, username: req.body.username};
  books_collection.findOne({title: req.body.bookname}, function(err, book){
    cart_collection.findOne(query, function(err, result){
      if(err) throw err;
      var inventory = parseInt(book.inventory);
      var originalbookcount = parseInt(result.bookcount);
      cart_collection.update(query, {
        $set: {
          bookcount: originalbookcount + add,
          isEnough: originalbookcount + add <= inventory,
        },
      })
      .then((updateDoc) => { });
      res.redirect(url);
    });
  });
});

//get checkout page
router.get("/:id/checkout", function(req, res){
  var cart_collection = db.get("cart");
  var cancheckout = true;
  Account.findById(req.params.id, function(err, user){
    if(err){
      res.redirect("/login");
    }
    cart_collection.find({ username: user.username }, function(err, items){
      if(err){
        res.redirect("/catalog");
      }
      for(var i = 0; i < items.length; i++){
        if(!items[i].isEnough){
          cancheckout = false;
        }
      }
      res.render("checkout", {user: user, items: items, cancheckout: cancheckout});
    });
  });
});

//success
router.post("/:id/success", function (req, res){
  var cart_collection = db.get("cart");
  var books_collection = db.get("books");
  var orders_collection = db.get("orders");

  var timeStamp = new Date().toLocaleString();
	var orderId = new Date().getTime().toFixed(0).toString();
  
  Account.findById(req.params.id, function(err, user){
    if(err){
      res.redirect("/login");
    }

    var order = {
      books: [],
      userid: req.params.id,
      username: user.username,
      orderid: orderId,
      ordertime: timeStamp,
    }
    cart_collection.find({ username: user.username }, function(err, items){
      if(err) throw err;

      //update books inventory
      for(var i = 0; i < items.length; i++){
        var add = parseInt(items[i].bookcount);
        var query = {title: items[i].bookname};
        books_collection.findOne(query, function (err, book){
          var inventory = parseInt(book.inventory);
          var remain = inventory - add;
          console.log(remain);
          books_collection.findOneAndUpdate(query, {
            $set: {
              inventory: remain,
            },
            function (err, book){
            if(err) throw err;
            }
          })
        })
        if(!items[i].isEnough){
          cancheckout = false;
        }
      }

      //making order object 
      for(var i = 0; i < items.length; i++){
        var book = {
          bookObject: items[i].bookObject,
          bookid: items[i].bookid,
          bookname: items[i].bookname,
          bookcount: items[i].bookcount,
        }
        order.books.push(book);
      }

      orders_collection.insert(order, function(err, orders){
        if(err) throw err;
      });
    });
    //remove from cart
    cart_collection.remove({username: user.username}, function(err, items){
      if(err) throw err;
      res.render("confirm", {user: user});
    });
  });
})

//get order history 
router.get("/:id/history", function(req,res){
  var orders_collection = db.get("orders");
  Account.findById(req.params.id, function(err, user){
    if(err){
      res.redirect("/login");
    }
    if(user.isAdmin){
      orders_collection.find({}, function(err, orders){
        if(err) throw err;
        res.render("history", {user: user, orders: orders});
      });
    }
    else {
      orders_collection.find({username: user.username}, function(err, orders){
        if(err) throw err;
        res.render("history", {user: user, orders: orders});
      });
    }
  });
});

//get order detail
router.get("/:id/:orderid", function(req, res){
  var orders_collection = db.get("orders");
  Account.findById(req.params.id, function(err, user){
    if(err){
      res.redirect("/login");
    }
    orders_collection.findOne({_id: req.params.orderid}, function(err, order){
      if(err) throw err;
      res.render('orderdetails', {user: user, order: order, items: order.books});
    });
  });
});

module.exports = router;