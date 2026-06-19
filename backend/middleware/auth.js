import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "your_jwt_secret_here";

const authMiddleware = async (req, res, next) => {

    try {
            const authHeader = req.headers.authorization;

            console.log("Authorization Header:", authHeader);

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized, token missing"
                });
            }

            const token = authHeader.split(" ")[1];

            const payload = jwt.verify(token, JWT_SECRET);

            const user = await User.findById(payload.userId).select("-password");

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }

            req.user = user;

            next();
    } catch (err) {
        console.error("JWT Verification Failed:", err);
        return res.status(401).json({
            success: false,
            message: "Token invalid or expired"
        });
    }
};

export default authMiddleware;