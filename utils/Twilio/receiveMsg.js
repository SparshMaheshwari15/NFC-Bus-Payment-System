const { MessagingResponse } = require("twilio").twiml;
const User = require("../../models/user.js");
const Razorpay = require("razorpay");
// Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

    if (!user.last_transactions || user.last_transactions.length === 0) {
        twiml.message(
            "We couldn't find any transaction history for your account."
        );
    } else {
        // Format the last transaction details
        let msg = `Hello ${user.student_name}(${user.student_id}), here is your last 5 transaction history:\n\n`;
        user.last_transactions.forEach((transaction, index) => {
            const transactionDate = new Date(transaction.date).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
            });

            const transactionTime = new Date(transaction.date).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            });

            msg += `*Transaction ${index + 1}*\n`;
            msg += `- Amount: ₹${transaction.amount}\n`;
            msg += `- Date: ${transactionDate}\n`;
            msg += `- Time: ${transactionTime}\n\n`;
        });

        //         const msg = `Hello ${user.student_name}, here are your last transaction details:
        // - Registration Number: ${user.student_id}
        // - Remaining Balance: ₹${user.balance}
        // - Transaction Date: ${transactionDate}
        // - Transaction Time: ${transactionTime}`;
        msg += `Current balance: ${user.balance}\n`;
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

// Function to top-up card
async function toTopUp(fromNumber) {
    const twiml = new MessagingResponse();
    const { user, errorMessage } = await fetchUser(fromNumber);
    if (errorMessage) {
        twiml.message(errorMessage);
        return twiml;
    }
    if (user.balance > 400) {
        twiml.message(
            `Hello ${user.student_name}(${user.student_id})
Currently your balance is ${user.balance}
Too much balance can't add more`

        )
        return twiml;
    }
    if (user.status === "Disabled") {
        twiml.message(
            `Hello ${user.student_name}(${user.student_id})
Your card is disabled
Contact the administrator to enable your card then try again`

        )
        return twiml;
    }

    // Generate Razorpay payment link
    const paymentLink = await razorpay.paymentLink.create({
        amount: 10000, // Amount in paise (₹100)
        currency: "INR",
        description: `Top-up for ${user.student_id}`,
        customer: {
            contact: user.phone_number,
        },
        notify: {
            sms: false,
            email: false,
        },
        callback_url: process.env.CALLBACK_URL,
        // callback_url: "http://localhost:3000/payment/status",
        callback_method: "get",
    });

    twiml.message(
        `Hello ${user.student_name}, 
click here to top up your account: ${paymentLink.short_url}.
Enter your registered mobile number on the payment portal
`
    );

    // console.log("Payment link sent");

    return twiml;
}

// Function to send last transaction details
async function sendLastTopupDetails(fromNumber) {
    const twiml = new MessagingResponse();
    const { user, errorMessage } = await fetchUser(fromNumber);

    if (errorMessage) {
        twiml.message(errorMessage);
        return twiml;
    }

    if (!user.last_top_ups || user.last_top_ups.length === 0) {
        twiml.message(
            "We couldn't find any transaction history for your account."
        );
    } else {
        // Format the last transaction details
        let msg = `Hello ${user.student_name}(${user.student_id}), here is your last 5 top-up history:\n\n`;
        user.last_top_ups.forEach((transaction, index) => {
            const transactionDate = new Date(transaction.date).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
            });

            const transactionTime = new Date(transaction.date).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            });

            msg += `*Transaction ${index + 1}*\n`;
            msg += `- Amount: ₹${transaction.amount}\n`;
            msg += `- Date: ${transactionDate}\n`;
            msg += `- Time: ${transactionTime}\n\n`;
        });

        //         const msg = `Hello ${user.student_name}, here are your last transaction details:
        // - Registration Number: ${user.student_id}
        // - Remaining Balance: ₹${user.balance}
        // - Transaction Date: ${transactionDate}
        // - Transaction Time: ${transactionTime}`;
        msg += `Current balance: ${user.balance}\n`;
        twiml.message(msg);
    }

    return twiml;
}

module.exports = { sendLastTransactionDetails, toDisableCard, toTopUp,sendLastTopupDetails };
