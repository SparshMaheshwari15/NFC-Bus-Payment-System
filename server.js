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

// const atlasUrl = process.env.ATLASDB_URL;
// main()
//     .then((res) => {
//         console.log("Connection Successful to DB");
//     })
//     .catch((e) => {
//         console.log("Error in db");
//         console.log(e);
//     });

// async function main() {
//     try {
//         await mongoose.connect("mongodb+srv://sparshmaheshwari15:lgXSc0lcNgXMG4mW@cluster0.bmdmq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
//         console.log("Connection Successful to DB");
//     } catch (e) {
//         console.log("Error in db");
//         console.error(e);
//     }
// }

// main();

// Express session middleware
app.use(
    session({
        secret: "yourSecretKey", // You can replace this with an environment variable
        resave: false,
        saveUninitialized: true,
    })
);

// Flash middleware
app.use(flash());

// Make flash messages available in all views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success");
    res.locals.error_msg = req.flash("error");
    next();
});

// Set up the EJS view engine
app.set("view engine", "ejs");
app.use(express.static("public")); // Serve static files

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
