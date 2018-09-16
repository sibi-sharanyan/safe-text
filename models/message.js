var mongoose = require("mongoose");

var schema = new mongoose.Schema({  
content : 'string'   , from : {type : mongoose.Schema.Types.ObjectId , ref : "user"} , to : {type : mongoose.Schema.Types.ObjectId , ref : "user"} , date: { type: Date, default: Date.now }
 }); 

module.exports = mongoose.model('Message', schema);