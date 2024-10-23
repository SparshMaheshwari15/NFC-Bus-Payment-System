const sendLastTransactionDetails = require("../utils/Twilio/receiveMsg");

exports.sendMsg = async (req, res) => {
    const receivedMessage = req.body.Body.trim(); // The message sent via WhatsApp
    let fromNumber = req.body.From; // User's WhatsApp number

    // Remove the "whatsapp:" prefix
    fromNumber = fromNumber.replace("whatsapp:", "");
    // Check if the message contains the keyword "transaction"
    if (receivedMessage.toLowerCase() === "transaction") {
        const twiml = await sendLastTransactionDetails(fromNumber); // Use the separated function
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
    } else {
        const twiml = new MessagingResponse();
        twiml.message(
            "Please send 'transaction' to receive your last transaction details."
        );
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
    }
};
