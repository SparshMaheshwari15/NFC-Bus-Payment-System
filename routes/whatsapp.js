const express = require("express");
const { sendMsg } = require("../controllers/whatsapp");
const router = express.Router();

// Route to render the EJS page with users
router.get("/",sendMsg );


module.exports = router;

