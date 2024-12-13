const express = require("express");
const whatsappController = require("../controllers/whatsapp");
const paymentController = require("../controllers/payment");
const router = express.Router();

router.post("/whatsapp", whatsappController.sendMsg);
// router.post("/whatsapp", twilio.webhook(), whatsappController.sendMsg);
router.post("/razorpay", paymentController.confirmPayment);

module.exports = router;
