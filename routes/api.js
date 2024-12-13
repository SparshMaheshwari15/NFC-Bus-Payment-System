const express = require("express");
const {
    getAllUsers,
    addUser,
    toggleUserStatus,
    deleteUser,
    registerUser,
    driverLogin,
    userLogin,
    logout,
    updateUser,
} = require("../controllers/user.js");

const {
    deductBalanceAdmin,
    deductBalanceBus,
    addBalance,
} = require("../controllers/balance.js");
const { validateUser } = require("../middleware.js");
const authenticateJWT = require("../utils/auth.js");
const passport = require("passport");
const {
    saveRedirectUrl,
    isAdmin,
    authenticateDriver,
    isDriver,
} = require("../middlewares/auth.js");
const router = express.Router();

// Route to get all users as JSON
// Keep this for API
router.get("/users", getAllUsers);

// Route to deduct balance
router.post(
    "/users/deductBalanceBus",
    // isDriver,
    authenticateJWT,
    deductBalanceBus
);

// Route to add balance
router.post("/users/addBalance", isAdmin, addBalance);
router.post("/users/addUser", isAdmin, validateUser, addUser);
router.post("/users/deductBalanceAdmin", isAdmin, deductBalanceAdmin);
router.post("/users/manage/toggle", isAdmin, toggleUserStatus);
router.delete("/users", isAdmin, deleteUser);
router.patch("/users", isAdmin, updateUser);
router.post("/users/login/driver", authenticateDriver, driverLogin);
router.post("/users/signup", isAdmin, registerUser);

router.post(
    "/users/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/users/login",
        failureFlash: true,
    }),
    userLogin
);

router.get("/users/logout", logout);
module.exports = router;
