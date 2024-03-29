const mongoose = require("mongoose");
const { database, dbUri, log } = require('./configs/constants.js');

const dbConnect = () => {
    const DB_URI = dbUri || "mongodb://localhost:27017/eTokenClaimSite"
    mongoose.connect(DB_URI, {
        dbName: database,
        useNewUrlParser: true,
        useUnifiedTopology: true
    },(err, res)=>{
        if(!err){
            log("Successful connection to database")
        }else{
            log("Incorrect connection to database")
        }
    })
}

module.exports = {
    dbConnect
}