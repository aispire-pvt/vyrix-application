const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
    {
        text: { type: String, required: true, trim: true },
        done: { type: Boolean, default: false },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user-data",
            required: true,
        },
    },
    { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("todo", todoSchema);
