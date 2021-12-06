var mongoose = require('mongoose');

// Create the Schema for the books
var Book = new mongoose.Schema({
    title: {type: String, required: true},
    author: {type: String, required: true},
    publisher: String,
    description: String,
    genre: [ String ],
    inventory: {type: string},
    image: String,
    isbn: String,
    isDeleted: {type:Boolean, default: false} // False intially when creating a new book
    },
    { collection : 'books' });

module.exports = mongoose.model('Book', Book);