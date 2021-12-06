var mongoose = require('mongoose');

var Order = new mongoose.Schema({
    books : { type: [Object] },
    userid : { type: String, required: true},
    username : { type: String, required: true},
    orderid : { type: String, required: true},
    ordertime : { type: String, required: true}
    }); 

module.exports = mongoose.model('Order', Order)