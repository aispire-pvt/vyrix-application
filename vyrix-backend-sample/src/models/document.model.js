const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        title: { type: String, default: "Untitled" },
        content: { type: Object, default: {} }, // TipTap JSON output
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user-data",
            required: true,
        },
        folder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "folder",
            default: null,
        },
        // Index into the frontend COVER_IMAGES pool, assigned randomly on create.
        coverIndex: { type: Number, default: 0, min: 0, max: 3 },
    },
    {
        versionKey: false,
        timestamps: true, // createdAt + updatedAt (used as lastEdited)
    }
);

module.exports = mongoose.model("document", documentSchema);
