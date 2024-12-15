if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connectDb = require("./dbConnection.js");

const methodOverride = require("method-override");

const apiRoutes = require("./routes/api.js");
const userRoutes = require("./routes/user.js");
const webhookRoutes = require("./routes/webhook.js");

const session = require("express-session");
const flash = require("connect-flash");

const MongoStore = require("connect-mongo");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const Account = require("./models/account.js");

const bodyParser = require("body-parser");

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
        store: MongoStore.create({
            mongoUrl: process.env.LOCALDB_URL,
        }),
        cookie: { maxAge: 180 * 60 * 1000 }, // Set cookie expiration
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
    res.locals.currUser = req.user;
    next();
});

// Use method-override
app.use(methodOverride("_method"));

// app.get("/testing", (req, res) => {
//     res.send(res.locals.currUser);
//     console.log(res.locals.currUser);
// });
app.use("/api", apiRoutes);
app.use("/users", userRoutes);

// Webhook to handle incoming WhatsApp messages
// app.use("/whatsapp", twilio.webhook(), whatsappRoutes);

app.use("/webhook", webhookRoutes);

app.get("/payment/status", async (req, res) => {
    const { razorpay_payment_id, razorpay_payment_link_status, razorpay_signature } = req.query;

    if (!razorpay_payment_id || !razorpay_signature || razorpay_payment_link_status!=="paid") {
        return res.redirect("/payment/failed");
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
        res.redirect(`/payment/success?payment_id=${razorpay_payment_id}`);
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

app.get("/payment/success", (req, res) => {
    res.render("payment/success.ejs");
});

app.get("/payment/failed", (req, res) => {
    res.render("payment/failed.ejs");
});


app.get("/", (req, res) => {
    res.redirect("users/view");
});
app.get("*", (req, res) => {
    res.render("error.ejs");
});

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
