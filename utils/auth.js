const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY;

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (authHeader) {
        const token = authHeader.split(" ")[1]; // 'Bearer token'
        jwt.verify(token, secretKey, (err, user) => {
            if (err) {
                // Forbidden if token is invalid
                return res.status(403).json({ error: "Token Invalid" });
            }
            req.user = user; // Save user data for later use in the request
            next();
        });
    } else {
        return res
            .status(401)
            .json({ error: "Unauthorized No token provided" });
    }
};

module.exports = authenticateJWT;
