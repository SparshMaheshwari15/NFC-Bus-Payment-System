const passport = require("passport");
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isAdmin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in");
        return res.redirect("/users/login");
    }
    const userRole = req.user.role;
    if (userRole !== "Admin") {
        req.flash("error", "You are not a Admin");
        return res.redirect("/users/login");
    }
    next();
};

module.exports.isDriver = (req, res, next) => {
    console.log(req.isAuthenticated());
    console.log("here");
    if (!req.isAuthenticated()) {
        // req.session.redirectUrl = req.originalUrl;
        // req.flash("error", "You must be logged in");
        // return res.redirect("/users/login");
        return res.status(401).json({ error: "Driver must be logged in" });
    }
    const userRole = req.user.role;
    if (userRole !== "Driver") {
        // req.flash("error", "You are not a Drive");
        // return res.redirect("/users/login");
        return res.status(401).json({ error: "You are not a Driver" });
    }
    next();
};

module.exports.authenticateDriver = (req, res, next) => {
    // Use a custom callback with passport.authenticate
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);

        // If user is not authenticated, send JSON response
        if (!user) {
            return res.status(401).json({ message: "Not logged in" });
        }

        // Log the user in
        req.logIn(user, (err) => {
            if (err) return next(err);

            // Check if the user has the Driver role
            if (user.role !== "Driver") {
                return res.status(403).json({
                    message: "Access denied: Only drivers can log in here.",
                });
            }

            // Proceed to the next middleware or route handler
            next();
        });
    })(req, res, next);
};
