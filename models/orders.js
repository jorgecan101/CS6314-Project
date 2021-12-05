var mongoose = require('mongoose');

var Order = new mongoose.Schema({
    // _id : ObjectId(""), // This is generated automatically
    books : { type: [Object] },
    userid : { type: String, required: true},
    username : { type: String, required: true},
    orderid : { type: String, required: true},
    ordertime : { type: String, required: true},
    // accountID: { type: String, required: true},
    // cartContents: { type: [Object] },
    // date: { type: Date, default: Date.now }
    }); 
    //, { collection : 'wishlists' }); // this assumes the database collection for wishlists already exists, else it creates it

module.exports = mongoose.model('Order', Order)