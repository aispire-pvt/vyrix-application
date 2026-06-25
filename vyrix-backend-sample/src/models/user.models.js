const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name:          { type: String, required: true },
        email:         { type: String, unique: true, required: true },
        password:      { type: String, default: null },
        googleId:      { type: String, default: null },
        username:      { type: String, trim: true, default: "" },
        profession:    { type: String, trim: true, default: "" },
        emailVerified: { type: Boolean, default: false },
        otp:           { type: String, default: null },
        otpExpiresAt:  { type: Date,   default: null },
        onboardingCompleted: { type: Boolean, default: false },

        // Opaque public ID written to Supabase catalog rows — never the Mongo _id
        contributorId: { type: String, default: null },

        // Login / usage tracking
        firstAppLoginAt: { type: Date, default: null },   // write-once
        lastLoginAt:     { type: Date, default: null },
        lastSeenAt:      { type: Date, default: null },   // updated on every app launch
        lastAppVersion:  { type: String, default: null },
    },
    { versionKey: false, timestamps: true }
);

userSchema.index({ firstAppLoginAt: 1 });

module.exports = mongoose.model("user-data", userSchema);
