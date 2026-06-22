const documentModel = require("../models/document.model");
const folderModel = require("../models/folder.model");

// POST /api/docs — create a new blank document owned by the current user.
async function createDocument(req, res) {
    try {
        const coverIndex = Math.floor(Math.random() * 4);
        const doc = await documentModel.create({
            owner: req.user.id,
            title: "Untitled",
            content: {},
            coverIndex,
        });
        return res.status(201).json({
            doc: {
                _id: doc._id,
                title: doc.title,
                content: doc.content,
                coverIndex: doc.coverIndex,
                updatedAt: doc.updatedAt,
            },
        });
    } catch (error) {
        console.error("createDocument error:", error);
        return res.status(500).json({ message: "Failed to create document" });
    }
}

// GET /api/docs — list the current user's documents (no content), newest first.
async function getMyDocuments(req, res) {
    try {
        const docs = await documentModel
            .find({ owner: req.user.id })
            .select("_id title coverIndex createdAt updatedAt")
            .sort({ updatedAt: -1 });
        return res.status(200).json({ docs });
    } catch (error) {
        console.error("getMyDocuments error:", error);
        return res.status(500).json({ message: "Failed to fetch documents" });
    }
}

// GET /api/docs/:id — full document, only if owned by the current user.
async function getDocument(req, res) {
    try {
        const doc = await documentModel.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ message: "Document not found" });
        }
        if (doc.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }
        return res.status(200).json({
            doc: {
                _id: doc._id,
                title: doc.title,
                content: doc.content,
                updatedAt: doc.updatedAt,
            },
        });
    } catch (error) {
        console.error("getDocument error:", error);
        return res.status(500).json({ message: "Failed to fetch document" });
    }
}

// PATCH /api/docs/:id — update title and/or content, only if owned.
async function updateDocument(req, res) {
    try {
        const doc = await documentModel.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ message: "Document not found" });
        }
        if (doc.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const { title, content } = req.body;
        if (title !== undefined) doc.title = title;
        if (content !== undefined) doc.content = content;
        await doc.save();

        return res.status(200).json({
            doc: {
                _id: doc._id,
                title: doc.title,
                updatedAt: doc.updatedAt,
            },
        });
    } catch (error) {
        console.error("updateDocument error:", error);
        return res.status(500).json({ message: "Failed to update document" });
    }
}

// DELETE /api/docs/:id — delete, only if owned.
async function deleteDocument(req, res) {
    try {
        const doc = await documentModel.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ message: "Document not found" });
        }
        if (doc.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }
        await doc.deleteOne();
        return res.status(200).json({ message: "Deleted" });
    } catch (error) {
        console.error("deleteDocument error:", error);
        return res.status(500).json({ message: "Failed to delete document" });
    }
}

// PATCH /api/docs/:id/move — move a doc into a folder (or out, folderId=null).
async function moveDocument(req, res) {
    try {
        const { folderId } = req.body;

        const doc = await documentModel.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ message: "Document not found" });
        }
        if (doc.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (folderId) {
            const folder = await folderModel.findById(folderId);
            if (!folder || folder.owner.toString() !== req.user.id) {
                return res.status(400).json({ message: "Invalid folder" });
            }
            doc.folder = folderId;
        } else {
            doc.folder = null;
        }
        await doc.save();

        return res.status(200).json({
            doc: { _id: doc._id, title: doc.title, folder: doc.folder },
        });
    } catch (error) {
        console.error("moveDocument error:", error);
        return res.status(500).json({ message: "Failed to move document" });
    }
}

module.exports = {
    createDocument,
    getMyDocuments,
    getDocument,
    updateDocument,
    deleteDocument,
    moveDocument,
};
