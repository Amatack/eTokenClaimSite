const dotenv = require("dotenv")
dotenv.config()

const active = process.env.ACTIVE
const allowedByCors = process.env.ALLOWED_BY_CORS
const amountOfEtoken = process.env.AMOUNT_OF_ETOKEN
const amountOfXec = process.env.AMOUNT_OF_XEC
const chronikInstance = process.env.CHRONIK_INSTANCE
const database = process.env.DATABASE
const dbUri = process.env.DB_URI
const log = console.log
const phrase = process.env.MNEMONIC
const senderAddress = process.env.SENDER_ADDRESS
const tokenId = process.env.TOKEN_ID

module.exports = {
    active,
    allowedByCors,
    amountOfXec,
    amountOfEtoken,
    chronikInstance,
    database,
    dbUri,
    log,
    phrase,
    senderAddress,
    tokenId,
}