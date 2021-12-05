var mongoose = require('mongoose');

var Cart = new mongoose.Schema({
    bookObject : { type: [Object] },
    bookid : { type: String, required: true},
    bookname : { type: String, required: true},
    bookcount: {type: String, required: true},
    userid : { type: String, required: true},
    username : { type: String, required: true},
    isEnough: {type: Boolean, required: true}
    }); 
module.exports = mongoose.model('cart', Cart)