const twilio = require("twilio");
require("dotenv").config(); // To load environment variables from .env file

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

function sendWhatsAppMessage(to, message) {
    client.messages
        .create({
            from: process.env.TWILIO_WHATSAPP_NUMBER, // Your Twilio WhatsApp number
            to: `whatsapp:${to}`, // The recipient's number
            body: message, // Message content
        })
        .then((message) => console.log(`Message sent: ${message.sid}`))
        .catch((error) => console.error(`Error sending message: ${error}`));
}

// Example usage
const userPhoneNumber = "+919811890414"; // Replace with the recipient's phone number
const notificationMessage = "Your card has been topped up successfully!";

sendWhatsAppMessage(userPhoneNumber, notificationMessage);
