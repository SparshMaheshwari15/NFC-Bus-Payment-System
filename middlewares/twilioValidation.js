const twilio = require("twilio");

const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN; // Replace with your actual Auth Token

function validateTwilioRequest(req, res, next) {
    console.log("Inside validateTwilioRequest");
    const twilioSignature = req.headers["x-twilio-signature"];
    const url = req.protocol + "://" + req.get("host") + req.originalUrl;

    console.log(`Validating Twilio request...`);
    console.log(`Twilio Signature: ${twilioSignature}`);
    console.log(`URL: ${url}`);
    console.log(`Request Body: ${JSON.stringify(req.body)}`);

    const isValid = twilio.validateRequest(
        TWILIO_AUTH_TOKEN,
        twilioSignature,
        url,
        req.body
    );

    if (!isValid) {
        console.log("Forbidden: Invalid request signature.");
        return res.status(403).send("Forbidden: Invalid request signature.");
    }
    console.log("Passed going to sendMsg");
    next();
}

module.exports = validateTwilioRequest;
