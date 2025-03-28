const express = require("express");
const router = express.Router();

router.get("/status", async (req, res) => {
    const {
        razorpay_payment_id,
        razorpay_payment_link_status,
        razorpay_signature,
    } = req.query;

    if (
        !razorpay_payment_id ||
        !razorpay_signature ||
        razorpay_payment_link_status !== "paid"
    ) {
        return res.render("payment/failed");
    }

    // try {
    //     // (Optional) Verify the payment signature for added security
    //     const isValidSignature = verifyRazorpaySignature({
    //         razorpay_payment_id,
    //         razorpay_order_id,
    //         razorpay_signature,
    //     });

    //     if (!isValidSignature) {
    //         return res.redirect("/payment/failed");
    //     }

    // Redirect to the success page
    return res.render("payment/success");
    // } catch (error) {
    //     console.error("Error verifying payment:", error);
    //     return res.redirect("/payment/failed");
    // }
});

// function verifyRazorpaySignature({ razorpay_payment_id, razorpay_order_id, razorpay_signature }) {
//     const crypto = require("crypto");
//     const generated_signature = crypto
//         .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
//         .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//         .digest("hex");
//     return generated_signature === razorpay_signature;
// }

module.exports = router;
