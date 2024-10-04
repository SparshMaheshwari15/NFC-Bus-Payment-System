const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    card_id: {
        type: String,
        required: true,
    },
    student_id: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
    status: {
        type: String,
        required: true,
        enum: ["Enabled", "Disabled"],
        default: "Disabled",
    },
    student_name: {
        type: String,
        required: true,
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
