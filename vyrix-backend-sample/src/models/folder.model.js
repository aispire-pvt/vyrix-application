const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user-data",
            required: true,
        },
        // null = top-level folder (shows on Home). Otherwise nested under a parent folder.
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "folder",
            default: null,
        },
    },
    { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("folder", folderSchema);
