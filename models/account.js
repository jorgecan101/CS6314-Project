var mongoose = require('mongoose'),
Schema = mongoose.Schema,
passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    email: {type: String, required:true, unique:true},
    name: {type:String, required:true}
});
//plugin for passport-local-mongoose
Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);