const twilio = require("twilio");
require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

function sendWhatsAppMessage(to, message) {
    client.messages
        .create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${to}`,
            body: message,
        })
        .then((message) => console.log(`Message sent: ${message.sid}`))
        .catch((error) => console.error(`Error sending message: ${error}`));
}

module.exports = sendWhatsAppMessage;
