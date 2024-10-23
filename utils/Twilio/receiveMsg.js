const { MessagingResponse } = require("twilio").twiml;
const User = require("../../models/user.js");

// Helper function to fetch user and handle errors
async function fetchUser(fromNumber) {
    try {
        const user = await User.findOne({ phone_number: fromNumber });
        if (!user) {
            return {
                user: null,
                errorMessage: "We couldn't find your account.",
            };
        }
        return { user, errorMessage: null };
    } catch (error) {
        console.error("Error fetching user:", error);
        return {
            user: null,
            errorMessage: "An error occurred while fetching your account.",
        };
    }
}

// Function to send last transaction details
async function sendLastTransactionDetails(fromNumber) {
    const twiml = new MessagingResponse();
    const { user, errorMessage } = await fetchUser(fromNumber);

    if (errorMessage) {
        twiml.message(errorMessage);
        return twiml;
    }

    if (!user.last_transaction) {
        twiml.message(
            "We couldn't find any transaction history for your account."
        );
    } else {
        // Format the last transaction details
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

        const msg = `Hello ${user.student_name}, here are your last transaction details:
- Registration Number: ${user.student_id}
- Remaining Balance: ₹${user.balance}
- Transaction Date: ${transactionDate}
- Transaction Time: ${transactionTime}`;

        twiml.message(msg);
    }

    return twiml;
}

// Function to disable card
async function toDisableCard(fromNumber) {
    const twiml = new MessagingResponse();
    const { user, errorMessage } = await fetchUser(fromNumber);
    if (errorMessage) {
        twiml.message(errorMessage);
        return twiml;
    }

    if (user.status === "Disabled") {
        twiml.message("Your card is already disabled.");
    } else {
        user.status = "Disabled";
        await user.save();
        twiml.message("Your card has been disabled successfully.");
    }

    return twiml;
}

module.exports = { sendLastTransactionDetails, toDisableCard };
