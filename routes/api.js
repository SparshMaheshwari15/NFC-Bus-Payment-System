const express = require("express");
const userController = require("../controllers/user.js");
const balanceController = require("../controllers/balance.js");
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
router.get("/users", userController.getAllUsers);

// Route to deduct balance
router.post(
    "/users/deductBalanceBus",
    // isDriver,
    authenticateJWT,
    balanceController.deductBalanceBus
);

// Route to add balance
router.post("/users/addBalance", isAdmin, balanceController.addBalance);
router.post("/users/addUser", isAdmin, validateUser, userController.addUser);
router.post(
    "/users/deductBalanceAdmin",
    isAdmin,
    balanceController.deductBalanceAdmin
);
router.post("/users/manage/toggle", isAdmin, userController.toggleUserStatus);
router.delete("/users", isAdmin, userController.deleteUser);
router.patch("/users", isAdmin, userController.updateUser);
router.post(
    "/users/login/driver",
    authenticateDriver,
    userController.driverLogin
);
router.post("/users/signup", isAdmin, userController.registerUser);

router.post(
    "/users/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/users/login",
        failureFlash: true,
    }),
    userController.userLogin
);

router.get("/users/logout", userController.logout);
module.exports = router;
