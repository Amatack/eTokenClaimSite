const dotenv = require("dotenv")
dotenv.config()

const allowedIP = process.env.ALLOWED_IP
const authHash = process.env.AUTH_HASH
const chronikInstance = process.env.CHRONIK_INSTANCE
const dbUri = process.env.DB_URI
const log = console.log
const phrase = process.env.MNEMONIC
const senderAddress = process.env.SENDER_ADDRESS
const tokenId = process.env.TOKEN_ID
const userAmount = process.env.USER_AMOUNT

module.exports = {
    allowedIP,
    authHash,
    chronikInstance,
    dbUri,
    log,
    phrase,
    senderAddress,
    tokenId,
    userAmount
}