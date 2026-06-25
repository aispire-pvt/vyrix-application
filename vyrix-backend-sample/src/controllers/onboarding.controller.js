const profileModel = require("../models/profile.model");
const uploadImage = require("../services/storage.service");
const userModel = require("../models/user.models");
const { sendOTPEmail } = require("../services/email.service");
const bcrypt = require("bcryptjs");

// Generate and email a 6-digit OTP to the authenticated user.
async function sendOTP(req, res) {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // 6-digit numeric OTP (100000–999999)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = await bcrypt.hash(otp, 10);

        user.otp = otpHash;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

        await sendOTPEmail(user.email, otp);

        return res.status(200).json({
            success: true,
            message: "A verification code has been sent to your email",
        });
    } catch (error) {
        console.error("sendOTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send verification code",
        });
    }
}

// Verify the OTP submitted by the authenticated user.
async function verifyOTP(req, res) {
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "Please provide the verification code",
            });
        }

        const user = await userModel.findById(req.user.id);
        if (!user || !user.otp || !user.otpExpiresAt) {
            return res.status(400).json({
                success: false,
                message: "No verification code was requested. Please request a new one.",
            });
        }

        if (user.otpExpiresAt.getTime() < Date.now()) {
            user.otp = null;
            user.otpExpiresAt = null;
            await user.save();
            return res.status(400).json({
                success: false,
                message: "The verification code has expired. Please request a new one.",
            });
        }

        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification code",
            });
        }

        user.emailVerified = true;
        user.otp = null;
        user.otpExpiresAt = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (error) {
        console.error("verifyOTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify the code",
        });
    }
}

// Save the user's onboarding profile (username, profession, optional picture).
async function onboardingProfile(req, res) {
    try {
        const { username, profession, theme = "light" } = req.body;

        if (!username?.trim() || username.trim().length > 50)
            return res.status(400).json({ success: false, message: "Username must be 1–50 characters" });
        if (profession && profession.length > 100)
            return res.status(400).json({ success: false, message: "Profession must be under 100 characters" });
        if (!["light", "dark"].includes(theme))
            return res.status(400).json({ success: false, message: "Invalid theme" });

        let profilePic = "";
        if (req.file) {
            try {
                const upload = await uploadImage(req.file.buffer.toString("base64"));
                profilePic = upload.url;
            } catch (uploadErr) {
                console.error("Image upload failed:", uploadErr);
                return res.status(502).json({ success: false, message: "Profile picture upload failed, please try again" });
            }
        }

        const data = await profileModel.create({
            user: req.user.id,
            profile_pic: profilePic,
            username,
            profession,
            theme,
        });

        await userModel.findByIdAndUpdate(req.user.id, {
            username,
            profession,
            onboardingCompleted: true,
        });

        return res.status(201).json({
            success: true,
            message: "User onboarded successfully",
            data,
        });
    } catch (error) {
        console.error("onboardingProfile error:", error);
        return res.status(500).json({
            success: false,
            message: "There was an error while onboarding the user",
        });
    }
}

module.exports = { sendOTP, verifyOTP, onboardingProfile };
