var mongoose = require('mongoose');

var Wishlist = new mongoose.Schema({
    // _id : ObjectId(""), // This is generated automatically
    bookObject : { type: [Object] },
    bookid : { type: String, required: true},
    bookname : { type: String, required: true},
    userid : { type: String, required: true},
    username : { type: String, required: true}
    // accountID: { type: String, required: true},
    // cartContents: { type: [Object] },
    // date: { type: Date, default: Date.now }
    }); 
    //, { collection : 'wishlists' }); // this assumes the database collection for wishlists already exists, else it creates it

module.exports = mongoose.model('Wishlist', Wishlist)