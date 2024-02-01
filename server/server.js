const express = require("express")
const app = express();
const cors = require("cors")

const routes = require("./routes/wallet.routes.js");
const { log } = require("./configs/constants.js");
const {dbConnect} = require("./db.js")

const PORT = 8080

dbConnect()

app.use(express.json());
app.use(cors())
app.set('trust proxy', true);

async function verifyServer(req, res, next) {
    try {
    const clientIp = req.ip
    log("clientIp: ", clientIp)
    next()
    } catch (error) {
        res.status(500).send('Incomplete Verification');
        console.log(error)    
    }
}

app.use(verifyServer)

app.use("/v1", routes)

app.listen(PORT, ()=>{
    console.log(`Server started on port ${PORT}`)
})

