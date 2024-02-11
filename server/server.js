const express = require("express")
const app = express();
const cors = require("cors")

const routes = require("./routes/wallet.routes.js");
const { allowedByCors, log } = require("./configs/constants.js");
const {dbConnect} = require("./db.js")

const PORT = 8080

dbConnect()

//Middlewares
const whiteList = [
    allowedByCors
]
const corsOptions = {
    origin: function (origin, callback){
        if(whiteList.indexOf(origin) !== -1 || !origin){
            callback(null,true)
        }else{
            callback(new Error('Not allowed by CORS'))
        }
    }
}
app.use(cors(corsOptions))

app.use(express.json());
app.set('trust proxy', true);

app.use("/v1", routes)

app.listen(PORT, ()=>{
    console.log(`Server started on port ${PORT}`)
})