const User = require("../models/user");
const sendWhatsAppMessage = require("../utils/Twilio/twilioClient");

exports.confirmPayment = async (req, res) => {
    const { payload } = req.body;
    if (
        payload &&
        payload.payment_link &&
        payload.payment_link.entity.status === "paid"
    ) {
        if (isNaN(payload.payment_link.entity.amount_paid)) {
            console.error(
                "Invalid amount:",
                payload.payment_link.entity.amount_paid
            );
            return res
                .status(404)
                .json({ message: "Amount is not a valid number" });
        }
        const phone = payload.payment_link.entity.customer.contact;
        const user = await User.findOne({ phone_number: phone });
        console.log(user);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user) {
            const amountPaid =
                parseInt(payload.payment_link.entity.amount_paid, 10) / 100; // Convert to ₹
            user.balance += amountPaid;
            await user.save();

            // Send WhatsApp confirmation
            // await axios.post("https://api.twilio.com/your-api-endpoint", {

            //     to: `whatsapp:${phone}`,
            //     body: `Your payment of ₹${amountPaid} was successful. Your new balance is ₹${user.balance}.`,
            // });
            const msg = `Hello ${user.student_name}(${user.student_id})
Your payment of ₹${amountPaid} is successfull
Updated balance is ₹${user.balance}
`;
            sendWhatsAppMessage(phone, msg);
            return res.status(200).send("Balance updated after payment");
        } else {
            console.log("User not found in razorpay payment");
            return res.status(404).send("User not found in razorpay payment");
        }
    } else {
        const phone = payload.payment_link.entity.customer.contact;
        const user = await User.findOne({ phone_number: phone });
        let msg = `Hello ${user.student_name}(${user.student_id})
Your payment of is unsuccessfull
Your balance is ₹${user.balance}
Try again with a new link
`;
            sendWhatsAppMessage(phone, msg);
            
        console.log("Payment not confirmed");
        return res.status(400).send("Payment not confirmed");
    }
};
