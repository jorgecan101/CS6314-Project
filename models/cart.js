var mongoose = require('mongoose');

var Cart = new mongoose.Schema({
    accountID: { type: String, required: true},
    cartContents: { type: [Object] },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('cart', Cart)