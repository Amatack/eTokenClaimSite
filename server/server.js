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

app.use("/v1", routes)

app.listen(PORT, ()=>{
    console.log(`Server started on port ${PORT}`)
})