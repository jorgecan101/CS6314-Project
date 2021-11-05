var express = require('express'); // Express.js for server-side scripting
// var router = express.Router();

var app = express();

// TODO: Make sure the database is created (use either monk or mongoose?)

// This is what she did in class
var monk = require('monk');
var db = monk('localhost:27017/library-db');
var collection = db.get('books');

