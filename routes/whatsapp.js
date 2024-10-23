const express = require("express");
const { sendMsg } = require("../controllers/whatsapp");
const validateTwilioRequest = require("../middlewares/twilioValidation");
const router = express.Router();

router.post("/", validateTwilioRequest, sendMsg);

module.exports = router;
