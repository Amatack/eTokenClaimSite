const express = require("express");
const router = express.Router()
const sendEtoken = require("../controllers/sendEtoken.js");
const getEtokenInfo = require("../controllers/getEtokenInfo.js");

router.get("/getEtokenInfo", getEtokenInfo)
router.post("/sendEtoken", sendEtoken)


module.exports = router