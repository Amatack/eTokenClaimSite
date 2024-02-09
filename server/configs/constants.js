const dotenv = require("dotenv")
dotenv.config()

const amountOfEtoken = process.env.AMOUNT_OF_ETOKEN
const amountOfXec = process.env.AMOUNT_OF_XEC
const chronikInstance = process.env.CHRONIK_INSTANCE
const dbUri = process.env.DB_URI
const log = console.log
const phrase = process.env.MNEMONIC
const senderAddress = process.env.SENDER_ADDRESS
const tokenId = process.env.TOKEN_ID

module.exports = {
    amountOfXec,
    amountOfEtoken,
    chronikInstance,
    dbUri,
    log,
    phrase,
    senderAddress,
    tokenId,
}