const userModel = require("../models/user.models");
const profileModel = require("../models/profile.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// In production the frontend (Vercel) and backend (e.g. Render) are on different
// domains, so the auth cookie must be SameSite=None + Secure to be sent cross-site.
// Locally we use Lax over http.
const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 15 * 60 * 1000, // 15 minutes (matches the JWT expiry)
};

async function registerUser(req, res) {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        const name = `${firstName} ${lastName}`.trim();

        const isUserAlreadyExists = await userModel.findOne({ email: email.toLowerCase() });
        if (isUserAlreadyExists) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists",
            });
        }

        const hash = await bcrypt.hash(password, 12);

        const user = await userModel.create({
            name,
            email: email.toLowerCase(),
            password: hash,
        });

        const token = jwt.sign
        (
            { id: user._id },
            process.env.JWT_SECRET, 
            {expiresIn: "15m"}
        );

        res.cookie("token", token, cookieOptions);

        return res.status(201).json({
            success: true,
            message: "User has been created successfully",
        });
    } catch (error) {
        console.error("registerUser error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Google-only accounts have no local password.
        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: "This account uses Google sign-in. Please continue with Google.",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "15m",
        });

        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            success: true,
            accessToken: token,
            tokenType: "Bearer",
            expiresIn: 900,
        });
    } catch (error) {
        console.error("loginUser error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// Clear the auth cookie. Options must match how it was set so the browser drops it.
async function logoutUser(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
    });
    return res.status(200).json({ success: true, message: "Logged out" });
}

// Sign in / sign up with Google. The frontend sends a Google OAuth access token;
// we verify it was issued for THIS app and fetch the verified profile from Google.
async function googleAuth(req, res) {
    try {
        const { accessToken } = req.body;
        if (!accessToken) {
            return res.status(400).json({ success: false, message: "Missing Google access token" });
        }

        // Verify the token's audience (anti-spoofing) and fetch the profile in parallel.
        const [tokenRes, userRes] = await Promise.all([
            fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`),
            fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
        ]);

        if (!tokenRes.ok || !userRes.ok) {
            return res.status(401).json({ success: false, message: "Invalid Google session" });
        }

        const tokenInfo = await tokenRes.json();
        const profile = await userRes.json();

        // The token must have been issued for our own client id.
        if (process.env.GOOGLE_CLIENT_ID && tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
            return res.status(401).json({ success: false, message: "Google token audience mismatch" });
        }

        const email = (profile.email || tokenInfo.email || "").toLowerCase();
        if (!email) {
            return res.status(400).json({ success: false, message: "Google account has no email" });
        }
        const googleId = profile.sub || tokenInfo.sub;
        const name = profile.name || email.split("@")[0];

        // Upsert: link existing accounts by email, otherwise create a verified one.
        let user = await userModel.findOne({ email });
        if (!user) {
            user = await userModel.create({ name, email, googleId, emailVerified: true });
        } else {
            let changed = false;
            if (!user.googleId) { user.googleId = googleId; changed = true; }
            if (!user.emailVerified) { user.emailVerified = true; changed = true; }
            if (changed) await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            success: true,
            onboardingCompleted: user.onboardingCompleted,
            emailVerified: user.emailVerified,
        });
    } catch (error) {
        console.error("googleAuth error:", error);
        return res.status(500).json({ success: false, message: "Google sign-in failed" });
    }
}

// Return the currently authenticated user (from the JWT cookie).
async function getMe(req, res) {
    try {
        const user = await userModel
            .findById(req.user.id)
            .select("-password -otp -otpExpiresAt");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const profile = await profileModel.findOne({ user: user._id });
        const firstName =
            (user.name || "").trim().split(" ")[0] || user.username || "";

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                firstName,
                name: user.name,
                email: user.email,
                username: user.username,
                profession: user.profession,
                emailVerified: user.emailVerified,
                onboardingCompleted: user.onboardingCompleted,
                profilePic: (profile && profile.profile_pic) || null,
            },
        });
    } catch (error) {
        console.error("getMe error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

module.exports = { registerUser, loginUser, logoutUser, googleAuth, getMe };
