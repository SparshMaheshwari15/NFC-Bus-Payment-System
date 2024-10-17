const User = require("../models/user");
const sendWhatsAppMessage = require("../twilioClient");

exports.deductBalanceBus = async (req, res) => {
    const token1 = req.headers["authorization1"];
    const token2 = req.headers["authorization2"];
    if (
        token1 !== process.env.ESP32TOKEN ||
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

            // sendWhatsAppMessage(user.phone_number, msg);
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
