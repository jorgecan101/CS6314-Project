var mongoose = require('mongoose');

// Create the Schema for the books
var Book = new mongoose.Schema({
    title: {type: String, required:true},
    author: {type: String, required: true},
    publisher: String,
    description: String,
    genre: [ String ],
    image: String,
    isbn: String
    },
    { collection : 'books' });

module.exports = mongoose.model('Book', Book);