const express = require("express");
const userController = require("../controllers/user");
const { isAdmin } = require("../middlewares/auth");
const router = express.Router();

// Route to render the EJS page with users
router.get("/view", isAdmin, userController.renderUsersPage);

// Render the add balance form page
router.get("/addBalance", isAdmin, (req, res) => {
    res.render("balance/addBalance.ejs");
});

// Route to render the add user form
router.get("/add", isAdmin, (req, res) => {
    res.render("user/addUser.ejs");
});

// Route to render the deduct balance form page
router.get("/deductBalanceAdmin", isAdmin, (req, res) => {
    res.render("balance/deductBalanceAdmin.ejs");
});

router.get("/manage", isAdmin, userController.renderManageUser);
router.get("/topup", isAdmin, userController.renderTopUpHistory);

// Render the signup page
router.get("/signup", isAdmin, (req, res) => {
    res.render("user/signup.ejs");
});

// Render login page
router.get("/login", (req, res) => {
    res.render("user/login.ejs");
});

module.exports = router;
