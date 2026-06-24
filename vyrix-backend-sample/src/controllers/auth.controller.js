const userModel       = require("../models/user.models");
const profileModel    = require("../models/profile.model");
const weeklyUsageModel = require("../models/weekly_usage.model");
const jwt             = require("jsonwebtoken");
const bcrypt          = require("bcryptjs");
const { randomUUID }  = require("crypto");

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure:   isProd,
    maxAge:   15 * 60 * 1000,
};

// Fields set on every explicit login
function loginTrackingFields(user, appVersion) {
    const now = new Date();
    const fields = {
        lastLoginAt:    now,
        lastSeenAt:     now,
        lastAppVersion: appVersion || null,
    };
    if (!user.firstAppLoginAt) fields.firstAppLoginAt = now;
    if (!user.contributorId)   fields.contributorId   = randomUUID();
    return fields;
}

async function registerUser(req, res) {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        const name = `${firstName} ${lastName}`.trim();
        const exists = await userModel.findOne({ email: email.toLowerCase() });
        if (exists) {
            return res.status(409).json({ success: false, message: "An account with this email already exists" });
        }

        const hash = await bcrypt.hash(password, 12);
        const user = await userModel.create({ name, email: email.toLowerCase(), password: hash });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        res.cookie("token", token, cookieOptions);

        return res.status(201).json({ success: true, message: "User has been created successfully" });
    } catch (error) {
        console.error("registerUser error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password, appVersion } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
        if (!user.password) {
            return res.status(401).json({ success: false, message: "This account uses Google sign-in. Please continue with Google." });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const tracking = loginTrackingFields(user, appVersion);
        await userModel.findByIdAndUpdate(user._id, { $set: tracking });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            success:          true,
            accessToken:      token,
            tokenType:        "Bearer",
            expiresIn:        900,
            contributorId:    tracking.contributorId   || user.contributorId,
            contributorDisplay: user.username || user.name || "",
        });
    } catch (error) {
        console.error("loginUser error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function logoutUser(req, res) {
    res.clearCookie("token", { httpOnly: true, sameSite: isProd ? "none" : "lax", secure: isProd });
    return res.status(200).json({ success: true, message: "Logged out" });
}

async function googleAuth(req, res) {
    try {
        const { accessToken, appVersion } = req.body;
        if (!accessToken) {
            return res.status(400).json({ success: false, message: "Missing Google access token" });
        }

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
        const profile   = await userRes.json();

        if (process.env.GOOGLE_CLIENT_ID && tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
            return res.status(401).json({ success: false, message: "Google token audience mismatch" });
        }

        const email    = (profile.email || tokenInfo.email || "").toLowerCase();
        if (!email) return res.status(400).json({ success: false, message: "Google account has no email" });

        const googleId = profile.sub || tokenInfo.sub;
        const name     = profile.name || email.split("@")[0];

        let user = await userModel.findOne({ email });
        if (!user) {
            user = await userModel.create({ name, email, googleId, emailVerified: true });
        } else {
            const upd = {};
            if (!user.googleId)      upd.googleId      = googleId;
            if (!user.emailVerified) upd.emailVerified  = true;
            if (Object.keys(upd).length) await userModel.findByIdAndUpdate(user._id, { $set: upd });
        }

        const tracking = loginTrackingFields(user, appVersion);
        await userModel.findByIdAndUpdate(user._id, { $set: tracking });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            success:             true,
            accessToken:         token,
            tokenType:           "Bearer",
            expiresIn:           900,
            onboardingCompleted: user.onboardingCompleted,
            emailVerified:       user.emailVerified,
            contributorId:       tracking.contributorId   || user.contributorId,
            contributorDisplay:  user.username || user.name || "",
        });
    } catch (error) {
        console.error("googleAuth error:", error);
        return res.status(500).json({ success: false, message: "Google sign-in failed" });
    }
}

async function getMe(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("-password -otp -otpExpiresAt");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const profile   = await profileModel.findOne({ user: user._id });
        const firstName = (user.name || "").trim().split(" ")[0] || user.username || "";

        return res.status(200).json({
            success: true,
            user: {
                id:                  user._id,
                firstName,
                name:                user.name,
                email:               user.email,
                username:            user.username,
                profession:          user.profession,
                emailVerified:       user.emailVerified,
                onboardingCompleted: user.onboardingCompleted,
                profilePic:          profile?.profile_pic || null,
                contributorId:       user.contributorId   || null,
                contributorDisplay:  user.username || user.name || "",
            },
        });
    } catch (error) {
        console.error("getMe error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// POST /api/auth/heartbeat — called on every Electron app launch (silent or not)
async function heartbeat(req, res) {
    try {
        const { appVersion } = req.body;
        await userModel.findByIdAndUpdate(req.user.id, {
            $set: {
                lastSeenAt: new Date(),
                ...(appVersion ? { lastAppVersion: appVersion } : {}),
            },
        });
        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error("heartbeat error:", error);
        return res.status(500).json({ ok: false });
    }
}

// POST /api/auth/usage — upsert weekly usage counters
async function logUsage(req, res) {
    try {
        const { counters = {}, appVersion } = req.body;
        const user = await userModel.findById(req.user.id).select("name");

        // UTC Monday of the current week
        const now  = new Date();
        const day  = now.getUTCDay();                    // 0=Sun … 6=Sat
        const weekStart = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - ((day + 6) % 7)          // roll back to Monday
        ));

        await weeklyUsageModel.findOneAndUpdate(
            { userId: req.user.id, weekStart },
            {
                $set: {
                    userName:   user.name,
                    appVersion: appVersion || null,
                    updatedAt:  new Date(),
                },
                $inc: {
                    "counters.opens":  counters.opens  || 0,
                    "counters.saves":  counters.saves  || 0,
                    "counters.aiRuns": counters.aiRuns || 0,
                },
            },
            { upsert: true }
        );

        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error("logUsage error:", error);
        return res.status(500).json({ ok: false });
    }
}

module.exports = { registerUser, loginUser, logoutUser, googleAuth, getMe, heartbeat, logUsage };
