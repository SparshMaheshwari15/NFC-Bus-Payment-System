const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const Accounts = require("./models/accounts");

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await Accounts.findOne({ username });
            if (!user) {
                return done(null, false, { message: "Incorrect username." });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: "Incorrect password." });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    })
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await Accounts.findById(id);
    done(null, user);
});

module.exports = passport;
