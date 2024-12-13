const User = require("../models/user");

exports.confirmPayment = async (req, res) => {
    const { payload } = req.body;
    console.log("In Webhook razorpay");
    // console.log(payload);
    if (
        payload &&
        payload.payment_link &&
        payload.payment_link.entity.status === "paid"
    ) {
        if (isNaN(payload.payment_link.entity.amount_paid)) {
            console.error("Invalid amount:", payload.payment_link.entity.amount_paid);
            console.log("Amount is not a valid number");
            return res
                .status(404)
                .json({ message: "Amount is not a valid number" });
        }
        const phone = payload.payment_link.entity.customer.contact;
        const user = await User.findOne({ phone_number: phone });
        console.log(user);

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }

        if (user) {
            const amountPaid = parseInt(payload.payment_link.entity.amount_paid, 10) / 100; // Convert to ₹
            user.balance += amountPaid;
            await user.save();

            // Send WhatsApp confirmation
            // await axios.post("https://api.twilio.com/your-api-endpoint", {

            //     to: `whatsapp:${phone}`,
            //     body: `Your payment of ₹${amountPaid} was successful. Your new balance is ₹${user.balance}.`,
            // });
            console.log("Balance updated after payment");
            return res.status(200).send("Balance updated after payment");
        } else {
            console.log("User not found in razorpay payment");
            return res.status(404).send("User not found in razorpay payment");
        }
    } else {
        console.log("Payment not confirmed");
        return res.status(400).send("Payment not confirmed");
    }
};
