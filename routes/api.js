const express = require("express");
const {
    getAllUsers,
    addUser,
    toggleUserStatus,
    deleteUser,
} = require("../controllers/user.js");

const {
    deductBalanceAdmin,
    deductBalanceBus,
    addBalance,
} = require("../controllers/balance.js");
const { validateUser } = require("../middleware.js");
const router = express.Router();

// Route to get all users as JSON
// Keep this for API
router.get("/users", getAllUsers);

// Route to deduct balance
router.post("/users/deductBalanceBus", deductBalanceBus);

// Route to add balance
router.post("/users/addBalance", addBalance);

router.post("/users/addUser", validateUser, addUser);
router.post("/users/deductBalanceAdmin", deductBalanceAdmin);
router.post("/users/manage/toggle", toggleUserStatus);
router.post("/users/delete", deleteUser);

module.exports = router;
