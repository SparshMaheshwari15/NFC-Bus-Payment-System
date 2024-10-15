const ProtectedCard = require("../models/protectedCard");
const User = require("../models/user");
const sendWhatsAppMessage = require("../twilioClient");

// Function to get all users (for API)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving users", error });
    }
};

// Function to render the EJS page with users
exports.renderUsersPage = async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.render("users", { users }); // Render the EJS template with users
    } catch (error) {
        req.flash("error", "Error retrieving users");
        // res.status(500).json({ message: "Error retrieving users", error });
    }
};

exports.deductBalanceBus = async (req, res) => {
    const token = req.headers["authorization"];
    const token2 = req.headers["authorization2"];

    if (
        token !== process.env.ESP32TOKEN ||
        token2 !== process.env.ESP32TOKEN2
    ) {
        // Compare with your token
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { card_id, amount } = req.body;
    if (amount < 0) {
        return res.status(401).json({ error: "Wrong amount" });
    }
    try {
        const user = await User.findOne({ card_id });
        const now = new Date();
        const MIN_TIME_BETWEEN_TRANSACTION =
            process.env.MIN_TIME_BETWEEN_TRANSACTION;
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.status === "Disabled") {
            return res.status(401).json({ error: "Card Disabled" });
        } else if (user.balance < amount) {
            user.status = "Disabled";
            return res.status(400).json({ error: "Insufficient balance" });
        } else if (
            user.last_transaction &&
            now - user.last_transaction < MIN_TIME_BETWEEN_TRANSACTION
        ) {
            return res
                .status(429)
                .json({ error: "Card used recently. Try again later." });
        } else {
            user.balance -= amount; // Deduct the balance
            user.last_transaction = now;
            res.json({
                success: "Balance deducted successfully",
                new_balance: user.balance,
            });
            const transactionDate = user.last_transaction.toLocaleDateString(
                "en-US",
                {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                }
            );

            const transactionTime = user.last_transaction.toLocaleTimeString(
                "en-US",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                }
            );
            const msg =
                `Hello ${user.student_name}, your NFC card for bus payment was used. The transaction details are as follows:\n` +
                `- Card ID: ${user.card_id}\n` +
                `- Registration Number: ${user.student_id}\n` +
                `- Amount Deducted: ₹${amount}\n` +
                `- Remaining Balance: ₹${user.balance}\n` +
                `- Transaction Date: ${transactionDate}\n` +
                `- Transaction Time: ${transactionTime}\n\n` +
                `Thank you for using the service!`;

            sendWhatsAppMessage(user.phone_number, msg);
        }
        if (user.balance < 20) {
            user.status = "Disabled";
        }
        await user.save(); // Save the updated user
    } catch (error) {
        console.error("Error deducting balance:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.addBalance = async (req, res) => {
    const { card_id, amount } = req.body;
    try {
        const user = await User.findOne({ card_id });
        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/users/addBalance");
            // return res.status(404).json({ message: "User not found" });
        }
        if (user.status === "Disabled") {
            user.status = "Enabled";
            req.flash("error", `Card disabled of card id ${user.card_id}`);
            return res.redirect("/users/manage");
        }
        // Convert amount to a number
        const amountToAdd = Number(amount);

        // Check if the amount is valid
        if (isNaN(amountToAdd) || amountToAdd <= 0) {
            req.flash("error", "Invalid amount");
            return res.redirect("/users/addBalance");
        }
        user.balance += amountToAdd; // Add the balance
        await user.save(); // Save the updated user
        req.flash("success", "Balance added successfully");
        return res.redirect("/users/view");

        // res.json({
        //     message: "Balance added successfully",
        //     new_balance: user.balance,
        // });
    } catch (error) {
        console.error("Error adding balance:", error);
        req.flash("error", "Internal Server Error(Add balance)");
        res.redirect("/users/addBalance");
        // res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.addUser = async (req, res) => {
    const { user } = req.body;
    if (
        !user.card_id ||
        !user.student_id ||
        !user.student_name ||
        !user.phone_number
    ) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const newUser = new User({
        card_id: user.card_id,
        student_id: user.student_id,
        student_name: user.student_name,
        phone_number: user.phone_number,
        // balance and Status will take default values
    });

    try {
        // Check for duplicates based on card_id or student_id
        const existingUser = await User.findOne({
            $or: [{ card_id: user.card_id }, { student_id: user.student_id }],
        });

        if (existingUser) {
            req.flash(
                "error",
                "User already exists with the provided card id or student id"
            );
            return res.redirect("/users/add");
        }

        const savedUser = await newUser.save();
        req.flash("success", "User Added");
        res.redirect("/users/view");
        // res.status(201).json({
        //     message: "User added successfully",
        //     user: savedUser,
        // });
    } catch (error) {
        console.error("Error adding user:", error);
        req.flash("error", "User not added");
        res.redirect("/users/add");
        // res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.deductBalanceAdmin = async (req, res) => {
    const { card_id, amount, token } = req.body;
    const newAmount = Number(amount);
    if (token !== process.env.LOCAL_TOKEN) {
        // Compare with your token
        req.flash("error", "Unauthorized Wrong Token");
        return res.redirect("users/deductBalance");
        // return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const user = await User.findOne({ card_id });

        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("users/deductBalance");
            // return res.status(404).json({ message: "User not found" });
        }
        if (user.status === "Disabled") {
            req.flash("error", "Card disabled");
            return res.redirect("users/view");
        }
        if (user.balance < newAmount) {
            req.flash("error", "Insufficient balance");
            return res.redirect("users/view");
            // return res.status(400).json({ message: "Insufficient balance" });
        }
        user.balance -= newAmount; // Deduct the balance
        await user.save(); // Save the updated user
        req.flash("success", "Balance deducted successfully");
        return res.redirect("users/view");

        // res.json({
        //     message: "Balance deducted successfully",
        //     new_balance: user.balance,
        // });
    } catch (error) {
        console.error("Error deducting balance:", error);
        req.flash("error", "Internal Server Error(Deduct Balance Admin");
        return res.redirect("users/deductBalanceAdmin");
        // res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.renderManageUser = async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.render("manageUsers", { users }); // Render the page with user data
    } catch (error) {
        console.error("Error fetching users:", error);
        req.flash("error", "Unable to fetch users");
        res.redirect("/users/view");
    }
};
exports.toggleUserStatus = async (req, res) => {
    const { card_id } = req.body;

    try {
        const user = await User.findOne({ card_id });
        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/users/manage");
        }

        // Toggle the status
        user.status = user.status === "Enabled" ? "Disabled" : "Enabled";
        await user.save();

        req.flash(
            "success",
            `User ${user.student_name} has been ${
                user.status === "Enabled" ? "enabled" : "disabled"
            } successfully.`
        );
        res.redirect("/users/manage");
    } catch (error) {
        console.error("Error toggling user status:", error);
        req.flash("error", "Unable to toggle user status");
        res.redirect("/users/manage");
    }
};

exports.deleteUser = async (req, res) => {
    const { card_id } = req.body;
    try {
        // Check if the user is protected
        const user = await ProtectedCard.findOne({ card_id });
        if (user) {
            req.flash(
                "error",
                "This user cannot be deleted it is a protected card."
            );
            return res.redirect("/users/manage");
        }
        const deleteUser = await User.findOneAndDelete({ card_id });
        if (!deleteUser) {
            req.flash("error", "User not found");
            return res.redirect("/users/view");
        }

        req.flash("success", "User deleted successfully");
        return res.redirect("/users/manage");
    } catch (error) {
        console.error("Error deleting user:", error);
        req.flash("error", "Internal Server Error (Delete User)");
        return res.redirect("/users/view");
    }
};
