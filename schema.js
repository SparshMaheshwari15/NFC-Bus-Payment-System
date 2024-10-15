const Joi = require("joi");

module.exports.userSchema = Joi.object({
    user: Joi.object({
        card_id: Joi.string().required(),
        student_id: Joi.string().required(),
        balance: Joi.number().default(0),
        student_name: Joi.string().required(),
        status: Joi.string().default("Disabled").allow("Enabled", "Disabled"),
        phone_number: Joi.string().required(),
    }).required(),
});
