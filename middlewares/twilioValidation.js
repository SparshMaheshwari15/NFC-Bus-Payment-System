const twilio = require("twilio");

const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

// Middleware to validate requests from Twilio
function validateTwilioRequest(req, res, next) {
    console.log("In validateTwilioRequest");
    const twilioSignature = req.headers["x-twilio-signature"];
    const url = req.protocol + "://" + req.get("host") + req.originalUrl;
    const requestBody = req.body;

    const isValid = twilio.validateRequest(
        TWILIO_AUTH_TOKEN,
        twilioSignature,
        url,
        requestBody
    );

    if (!isValid) {
        return res.status(403).send("Forbidden: Invalid request signature.");
    }

    next();
}

module.exports = validateTwilioRequest;
