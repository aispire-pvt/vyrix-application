const jwt       = require("jsonwebtoken");
const userModel = require("../models/user.models");

// Accepts a JWT from either:
//   - httpOnly cookie (web / fallback)
//   - Authorization: Bearer <token> header (Electron)
async function authUser(req, res, next) {
    let token = req.cookies.token;

    if (!token) {
        const header = req.headers.authorization || "";
        if (header.startsWith("Bearer ")) token = header.slice(7);
    }

    if (!token) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(403).json({ message: "Unauthorized" });
    }
}

async function requireOnboarded(req, res, next) {
    try {
        const user = await userModel
            .findById(req.user.id)
            .select("emailVerified onboardingCompleted");
        if (!user) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        if (!user.emailVerified || !user.onboardingCompleted) {
            return res.status(412).json({
                message:             "Please verify your email and complete onboarding",
                emailVerified:       user.emailVerified,
                onboardingCompleted: user.onboardingCompleted,
            });
        }
        next();
    } catch (error) {
        console.error("requireOnboarded error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { authUser, requireOnboarded };
