const express = require("express");
const {
    getAllUsers,
    addUser,
    toggleUserStatus,
    deleteUser,
    registerUser,
    driverLogin,
    userLogin,
} = require("../controllers/user.js");

const {
    deductBalanceAdmin,
    deductBalanceBus,
    addBalance,
} = require("../controllers/balance.js");
const { validateUser } = require("../middleware.js");
const authenticateJWT = require("../utils/auth.js");
const passport = require("passport");
const router = express.Router();

// Route to get all users as JSON
// Keep this for API
router.get("/users", getAllUsers);

// Route to deduct balance
router.post("/users/deductBalanceBus", authenticateJWT, deductBalanceBus);

// Route to add balance
router.post("/users/addBalance", addBalance);

router.post("/users/addUser", validateUser, addUser);
router.post("/users/deductBalanceAdmin", deductBalanceAdmin);
router.post("/users/manage/toggle", toggleUserStatus);
router.post("/users/delete", deleteUser);
router.post("/users/login/driver", driverLogin);
router.post("/users/signup", registerUser);

router.post(
    "/users/login",
    passport.authenticate("local", {
        failureRedirect: "/users/login",
        failureFlash: true,
    }),
    userLogin
);
module.exports = router;
