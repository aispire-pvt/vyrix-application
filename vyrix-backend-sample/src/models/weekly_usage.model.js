const mongoose = require("mongoose");

const weeklyUsageSchema = new mongoose.Schema(
    {
        userId:     { type: mongoose.Schema.Types.ObjectId, ref: "user-data", required: true },
        userName:   { type: String },           // snapshotted at write time
        weekStart:  { type: Date, required: true },  // UTC Monday 00:00
        counters: {
            opens:  { type: Number, default: 0 },
            saves:  { type: Number, default: 0 },
            aiRuns: { type: Number, default: 0 },
        },
        appVersion: { type: String, default: null },
        updatedAt:  { type: Date },
    },
    { versionKey: false }
);

weeklyUsageSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model("weekly-usage", weeklyUsageSchema);
