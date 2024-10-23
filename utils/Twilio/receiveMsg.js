// Import necessary modules
const { MessagingResponse } = require("twilio").twiml;
const User = require("../../models/user.js");

// Function to send last transaction details
async function sendLastTransactionDetails(fromNumber) {
    const twiml = new MessagingResponse();

    try {
        // Find the user by their phone number in the database
        const user = await User.findOne({ phone_number: fromNumber });
        if (!user || !user.last_transaction) {
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
- Transaction Time: ${transactionTime}
`;
            twiml.message(msg);
        }
    } catch (error) {
        console.error("Error fetching user transaction:", error);
        twiml.message(
            "An error occurred while fetching your transaction details."
        );
    }

    return twiml;
}

module.exports = sendLastTransactionDetails;
