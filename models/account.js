const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const accountSchema = new Schema({
    role: {
        type: String,
        enum: ["Driver", "Admin", "Viewer"],
        default: "Driver",
        required: true,
    },
    phone_number: {
        type: String,
        // required: true,
        // unique: true,
        default: "+919811890414",
        lowercase: true,
        trim: true, // Remove whitespace from both ends
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
});

accountSchema.plugin(passportLocalMongoose);

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
