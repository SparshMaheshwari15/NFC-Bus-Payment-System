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

// Set up the EJS view engine
app.set("view engine", "ejs");
app.use(express.static("public")); // Serve static files

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get("*", (req, res) => {
    res.redirect("/users/view");
});

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
