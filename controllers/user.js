const ProtectedCard = require("../models/protectedCard");
const User = require("../models/user");

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
        res.render("users", { users }); // Render the EJS template with users
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
        res.render("manageUsers", { users }); // Render the page with user data
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
