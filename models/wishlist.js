var mongoose = require('mongoose');

var Wishlist = new mongoose.Schema({
    bookObject : { type: [Object] },
    bookid : { type: String, required: true},
    bookname : { type: String, required: true},
    userid : { type: String, required: true},
    username : { type: String, required: true}
    }); 

module.exports = mongoose.model('Wishlist', Wishlist)