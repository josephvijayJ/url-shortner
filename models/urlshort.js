const mongoose = require("mongoose");

const URlSchema =   mongoose.Schema({
    longUrl : {
        type : String,
       required : true
    },
    shortUrl : {
        type : String,
        unique : true
    },
    clickCount : {
        type : Number ,
        default : 0
    }
})


const UrlModel = mongoose.model("urlshort",URlSchema);

module.exports = {UrlModel};