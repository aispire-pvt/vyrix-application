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

        // Project overview description (editable, saved on blur).
        description: { type: String, default: "" },

        // Attached files/links. Each: { id, type, name, url, createdAt }
        // type: 'document' | 'pdf' | 'link' | 'canva' | 'figma'
        attachments: { type: Array, default: [] },

        // Flow repository. Each: { id, name, files: [{ id, name, type, url }] }
        // Ordered — position matters for drag/swap.
        flows: { type: Array, default: [] },
    },
    {
        versionKey: false,
        timestamps: true, // createdAt + updatedAt (used as lastEdited)
    }
);

module.exports = mongoose.model("document", documentSchema);
