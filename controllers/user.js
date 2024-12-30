const jwt = require("jsonwebtoken");
const ProtectedCard = require("../models/protectedCard");
const User = require("../models/user");
const Account = require("../models/account");

// Function to get all users (for API)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving users", error });
    }
};

// Function to render the EJS page with users
exports.renderUsersPage = async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.render("user/users", { users }); // Render the EJS template with users
    } catch (error) {
        req.flash("error", "Error retrieving users");
        // res.status(500).json({ message: "Error retrieving users", error });
    }
};

exports.addUser = async (req, res) => {
    const { user } = req.body;
    if (
        !user.card_id ||
        !user.student_id ||
        !user.student_name ||
        !user.phone_number
    ) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const newUser = new User({
        card_id: user.card_id,
        student_id: user.student_id,
        student_name: user.student_name,
        phone_number: user.phone_number,
        // balance and Status will take default values
    });

    try {
        // Check for duplicates based on card_id or student_id
        const existingUser = await User.findOne({
            $or: [{ card_id: user.card_id }, { student_id: user.student_id }],
        });

        if (existingUser) {
            req.flash(
                "error",
                "User already exists with the provided card id or student id"
            );
            return res.redirect("/users/add");
        }

        const savedUser = await newUser.save();
        req.flash("success", "User Added");
        res.redirect("/users/view");
        // res.status(201).json({
        //     message: "User added successfully",
        //     user: savedUser,
        // });
    } catch (error) {
        console.error("Error adding user:", error);
        req.flash("error", "User not added");
        res.redirect("/users/add");
        // res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.renderManageUser = async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.render("user/manageUsers", { users }); // Render the page with user data
    } catch (error) {
        console.error("Error fetching users:", error);
        req.flash("error", "Unable to fetch users");
        res.redirect("/users/view");
    }
};
exports.toggleUserStatus = async (req, res) => {
    const { card_id } = req.body;

    try {
        const user = await User.findOne({ card_id });
        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/users/manage");
        }

        // Toggle the status
        user.status = user.status === "Enabled" ? "Disabled" : "Enabled";
        await user.save();

        req.flash(
            "success",
            `User ${user.student_name} has been ${
                user.status === "Enabled" ? "enabled" : "disabled"
            } successfully.`
        );
        res.redirect("/users/manage");
    } catch (error) {
        console.error("Error toggling user status:", error);
        req.flash("error", "Unable to toggle user status");
        res.redirect("/users/manage");
    }
};

exports.deleteUser = async (req, res) => {
    const { card_id } = req.body;
    try {
        // Check if the user is protected
        const user = await ProtectedCard.findOne({ card_id });
        if (user) {
            req.flash(
                "error",
                "This user cannot be deleted it is a protected card."
            );
            return res.redirect("/users/manage");
        }
        const deleteUser = await User.findOneAndDelete({ card_id });
        if (!deleteUser) {
            req.flash("error", "User not found");
            return res.redirect("/users/view");
        }

        req.flash("success", "User deleted successfully");
        return res.redirect("/users/manage");
    } catch (error) {
        console.error("Error deleting user:", error);
        req.flash("error", "Internal Server Error (Delete User)");
        return res.redirect("/users/view");
    }
};

exports.updateUser = async (req, res) => {
    const { card_id } = req.body;
    try {
        // Check if the user is protected
        const user = await ProtectedCard.findOne({ card_id });
        if (user) {
            req.flash(
                "error",
                "This user cannot be updated it is a protected card."
            );
        } else {
            req.flash("success", "Working");
        }
        return res.redirect("/users/manage");
    } catch (error) {
        console.error("Error updating user:", error);
        req.flash("error", "Internal Server Error (Update User)");
        return res.redirect("/users/view");
    }
};

exports.driverLogin = async (req, res) => {
    try {
        const user = req.user;
        // console.log(user);
        // Check if the user object exists
        if (!user) {
            return res.status(401).json({ message: "User not authenticated." });
        }

        // Define your secret key and expiration time
        const secretKey = process.env.JWT_SECRET_KEY;
        const expireTime = process.env.EXPIRE_TIME || "1h"; // Default to 1 hour if not set

        // Create a token payload
        const payload = {
            userId: user._id,
            role: user.role,
        };

        // Sign the token with the secret key
        const token = jwt.sign(payload, secretKey, { expiresIn: expireTime });

        // Send the token to the client
        console.log("Driver login success");
        res.json({ token });
    } catch (error) {
        console.error("Error during token generation:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.registerUser = async (req, res) => {
    try {
        let { username, role, password, email } = req.body;
        const newUser = new Account({ username, role, email });
        await Account.register(newUser, password);
        req.flash("success", "User Registered successfully");

        return res.redirect("/users/view");
        // return res
        //     .status(404)
        //     .json({ success: "User Registered successfully" });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/users/signup");
        // return res.status(404).json({ error: e.message });
    }
};

module.exports.userLogin = async (req, res) => {
    req.flash("success", "Login in successfully");
    let redirectUrl = res.locals.redirectUrl || "/users/view";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out successfully!");
        res.redirect("/users/view");
    });
};

module.exports.renderTopUpHistory=async(req,res)=>{
    try {
        const users = await User.find(); // Fetch all users
        res.render("user/topUpHistory", { users }); // Render the page with user data
    } catch (error) {
        console.error("Error fetching users top-up history:", error);
        req.flash("error", "Unable to fetch users top-up history");
        res.redirect("/users/view");
    }
}
