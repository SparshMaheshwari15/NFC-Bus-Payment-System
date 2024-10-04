const { userSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError");

module.exports.validateUser = (req, res, next) => {
    let { error } = userSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        return res.status(400).json({ error: errMsg });
    } else {
        next();
    }
};
