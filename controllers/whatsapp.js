const { MessagingResponse } = require("twilio").twiml;
const {
    sendLastTransactionDetails,
    toDisableCard,
    toTopUp,
    sendLastTopupDetails,
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
        } else if (receivedMessage.toLowerCase() === "top-up") {
            const twiml = await toTopUp(fromNumber);
            res.writeHead(200, { "Content-Type": "text/xml" });
            res.end(twiml.toString());
        } else if (receivedMessage.toLowerCase() === "top-up history") {
            const twiml = await sendLastTopupDetails(fromNumber);
            res.writeHead(200, { "Content-Type": "text/xml" });
            res.end(twiml.toString());
        } else {
            const twiml = new MessagingResponse();
            twiml.message(
`Please send 
'transaction' to receive your last 5 transaction details 
'disable' to disable your card
'top-up' to recharge your card
'top-up history' to receive your last 5 top-up details

`
            );
            res.writeHead(200, { "Content-Type": "text/xml" });
            res.end(twiml.toString());
        }
    } catch (error) {
        console.error("Error in Twilio webhook:", error);
        const twiml = new MessagingResponse();
        twiml.message(
            "An error occurred while processing your request. Please try again later."
        );
        res.writeHead(500, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
    }
};
