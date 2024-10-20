const express = require("express");
const {
    renderUsersPage,
    renderManageUser,
    userLogin,
} = require("../controllers/user");
const router = express.Router();

// Route to render the EJS page with users
router.get("/view", renderUsersPage);

// Render the add balance form page
router.get("/addBalance", (req, res) => {
    res.render("balance/addBalance.ejs");
});

// Route to render the add user form
router.get("/add", (req, res) => {
    res.render("user/addUser.ejs");
});

// Route to render the deduct balance form page
router.get("/deductBalanceAdmin", (req, res) => {
    res.render("balance/deductBalanceAdmin.ejs");
});

router.get("/manage", renderManageUser);

// Render the signup page
router.get("/signup", (req, res) => {
    res.render("user/signup.ejs");
});

// Render login page
router.get("/login", (req, res) => {
    res.render("user/login.ejs");
});
module.exports = router;
