const twilio = require("twilio");
const express = require("express");
const whatsappController  = require("../controllers/whatsapp");
// const validateTwilioRequest = require("../middlewares/twilioValidation");
const router = express.Router();

router.post("/", whatsappController.sendMsg);

module.exports = router;
