const twilio = require("twilio");
const express = require("express");
const { sendMsg } = require("../controllers/whatsapp");
// const validateTwilioRequest = require("../middlewares/twilioValidation");
const router = express.Router();

router.post("/", sendMsg);

module.exports = router;
