const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    card_id: {
        type: String,
        required: true,
        unique: true,
    },
    student_id: {
        type: String,
        required: true,
        unique: true,
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
    last_transaction: {
        type: Date,
        default: new Date(),
    },
    phone_number: {
        type: String,
        // required: true,
        // unique: true,
        default: "+919811890414",
    },
    last_top_up_date: {
        type: Date,
        default: new Date(),
    },
    last_top_up_amount: {
        type: Number,
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
