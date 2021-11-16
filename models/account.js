var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new mongoose.Schema({
    email: {type: String, required:true, unique:true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    username: {type:String, required:true, unique:true},
    password: String
});
//plugin for passport-local-mongoose
Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);