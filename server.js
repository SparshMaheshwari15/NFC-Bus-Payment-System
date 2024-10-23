if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connectDb = require("./dbConnection.js");

const apiRoutes = require("./routes/api.js");
const userRoutes = require("./routes/user.js");

const session = require("express-session");
const flash = require("connect-flash");

// const MongoStore = require("connect-mongo")

const passport = require("passport");
const LocalStrategy = require("passport-local");
const Account = require("./models/account.js");
const { registerUser } = require("./controllers/user.js");

const bodyParser = require("body-parser");
const sendLastTransactionDetails = require("./utils/Twilio/readmsg.js");

// Set up the EJS view engine
app.set("view engine", "ejs");
app.use(express.static("public")); // Serve static files

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: false }));

// Express session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET_KEY,
        resave: false,
        saveUninitialized: true,
        // store: new MongoStore({ mongooseConnection: mongoose.connection }),
        // cookie: { maxAge: 180 * 60 * 1000 }, // Set cookie expiration
    })
);

// Flash middleware
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Account.authenticate()));

passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// Make flash messages available in all views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success");
    res.locals.error_msg = req.flash("error");
    // res.locals.currUser = req.user;
    next();
});

app.use("/api", apiRoutes);
app.use("/users", userRoutes);

// Webhook to handle incoming WhatsApp messages
app.post("/whatsapp", async (req, res) => {
    console.log(req.body);
    const receivedMessage = req.body.Body.trim(); // The message sent via WhatsApp
    const fromNumber = req.body.From; // User's WhatsApp number

    // Remove the "whatsapp:" prefix
    fromNumber = fromNumber.replace('whatsapp:', '');
    console.log(`receivedMessage: ${receivedMessage}`);
    console.log(`fromNumber: ${fromNumber}`);
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
});
app.get("*", (req, res) => {
    res.redirect("/users/view");
});

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
