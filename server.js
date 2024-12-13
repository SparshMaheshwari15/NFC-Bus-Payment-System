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
const whatsappRoutes = require("./routes/whatsapp.js");

const session = require("express-session");
const flash = require("connect-flash");

const MongoStore = require("connect-mongo");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const Account = require("./models/account.js");

const bodyParser = require("body-parser");
const twilio = require("twilio");
const { isAdmin } = require("./middlewares/auth.js");

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
app.use("/whatsapp", whatsappRoutes);

app.post("/webhook/razorpay", async (req, res) => {
    const { payload } = req.body;
    console.log("In Webhook razorpay");
    console.log(payload);
    if (
        payload &&
        payload.payment_link &&
        payload.payment_link.entity.status === "paid"
    ) {
        const phone = payload.payment_link.entity.customer.contact;
        const user = await User.findOne({ phone });

        if (user) {
            const amountPaid = payload.payment_link.amount / 100; // Convert to ₹
            user.balance += amountPaid;
            await user.save();

            // Send WhatsApp confirmation
            // await axios.post("https://api.twilio.com/your-api-endpoint", {

            //     to: `whatsapp:${phone}`,
            //     body: `Your payment of ₹${amountPaid} was successful. Your new balance is ₹${user.balance}.`,
            // });
            console.log("Balance updated after payment");
            res.status(200).send("Balance updated after payment");
        } else {
            console.log("User not found in razorpay payment");
            res.status(404).send("User not found in razorpay payment");
        }
    } else {
        console.log("Payment not confirmed");
        res.status(400).send("Payment not confirmed");
    }
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
