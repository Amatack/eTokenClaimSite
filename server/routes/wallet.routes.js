const express = require("express");
const router = express.Router()
const sendEtoken = require("../controllers/sendEtoken.js")

router.post("/sendEtoken", sendEtoken)


module.exports = router