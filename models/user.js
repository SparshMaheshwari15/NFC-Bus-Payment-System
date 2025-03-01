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
    // last_transaction: {
    //     type: Date,
    //     default: new Date(),
    // },
    last_transactions: [
        {
            date: { type: Date, default: Date.now },
            amount: { type: Number, required: true },
        }
    ],
    phone_number: {
        type: String,
        required: true,
        unique: true,
    },
    // last_top_up_date: {
    //     type: Date,
    //     default: new Date(),
    // },
    // last_top_up_amount: {
    //     type: Number,
    // },
    last_top_ups: [
        {
            date: { type: Date, default: Date.now },
            amount: { type: Number, required: true },
        }
    ],
});

// Middleware to ensure only the last 5 transactions and top-ups are stored
userSchema.pre("save", function (next) {
    if (this.last_transactions.length > 5) {
        this.last_transactions = this.last_transactions.slice(-5); // Keep last 5 transactions
    }
    if (this.last_top_ups.length > 5) {
        this.last_top_ups = this.last_top_ups.slice(-5); // Keep last 5 top-ups
    }
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
