const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const protectedCardSchema = new Schema({
    card_id: {
        type: String,
        unique: true,
        required: true,
    },
});

const ProtectedCard = mongoose.model("ProtectedCard", protectedCardSchema);

module.exports = ProtectedCard;
