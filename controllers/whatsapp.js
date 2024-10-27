const { MessagingResponse } = require("twilio").twiml;
const {
    sendLastTransactionDetails,
    toDisableCard,
} = require("../utils/Twilio/receiveMsg.js");

exports.sendMsg = async (req, res) => {
    const receivedMessage = req.body.Body.trim(); // The message sent via WhatsApp
    let fromNumber = req.body.From; // User WhatsApp number

    // Remove the "whatsapp:" prefix
    fromNumber = fromNumber.replace("whatsapp:", "");
    try {
        // Check if the message contains the keyword "transaction"
        if (receivedMessage.toLowerCase() === "transaction") {
            const twiml = await sendLastTransactionDetails(fromNumber);
            res.writeHead(200, { "Content-Type": "text/xml" });
            res.end(twiml.toString());
        } else if (receivedMessage.toLowerCase() === "disable") {
            const twiml = await toDisableCard(fromNumber);
            res.writeHead(200, { "Content-Type": "text/xml" });
            res.end(twiml.toString());
        } else {
            const twiml = new MessagingResponse();
            twiml.message(
                "Please send 'transaction' to receive your last transaction details or send 'disable' to disable your card "
            );
            res.writeHead(200, { "Content-Type": "text/xml" });
            res.end(twiml.toString());
        }
    } catch (error) {
        console.error("Error in Twilio webhook:", error);
        twiml.message(
            "An error occurred while processing your request. Please try again later."
        );
        res.writeHead(500, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
    }
};
