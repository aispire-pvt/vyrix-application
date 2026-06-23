const crypto = require("crypto");
const documentModel = require("../models/document.model");
const folderModel = require("../models/folder.model");
const uploadImage = require("../services/storage.service");

// Every project starts with these four flows pre-made; user-created flows are
// appended after them.
const DEFAULT_FLOW_NAMES = [
    "Pre Research",
    "Interview and surveys",
    "Research Materials",
    "Research Papers",
];

function buildDefaultFlows() {
    return DEFAULT_FLOW_NAMES.map((name) => ({
        id: crypto.randomUUID(),
        name,
        files: [],
        isDefault: true,
        createdAt: new Date(),
    }));
}

// Map an uploaded file's mimetype/extension to a friendly type used by the UI
// to pick the right icon (image / pdf / word / ppt / excel / text / file).
function detectFileType(mimetype = "", name = "") {
    const mt = (mimetype || "").toLowerCase();
    const ext = (name.split(".").pop() || "").toLowerCase();
    if (mt.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "heic"].includes(ext)) return "image";
    if (mt.includes("pdf") || ext === "pdf") return "pdf";
    if (mt.includes("word") || mt.includes("wordprocessing") || ["doc", "docx"].includes(ext)) return "word";
    if (mt.includes("presentation") || mt.includes("powerpoint") || ["ppt", "pptx"].includes(ext)) return "ppt";
    if (mt.includes("sheet") || mt.includes("excel") || ["xls", "xlsx", "csv"].includes(ext)) return "excel";
    if (mt.startsWith("text/") || ["txt", "md", "rtf"].includes(ext)) return "text";
    return "file";
}

// POST /api/docs — create a new blank document owned by the current user.
async function createDocument(req, res) {
    try {
        const coverIndex = Math.floor(Math.random() * 4);
        const doc = await documentModel.create({
            owner: req.user.id,
            title: "Untitled",
            content: {},
            coverIndex,
            flows: buildDefaultFlows(),
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
        // Exclude only the heavy TipTap content; attachments/flows are lightweight
        // arrays the Repo views need to list uploaded files without per-doc calls.
        const docs = await documentModel
            .find({ owner: req.user.id })
            .select("-content")
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
        // Backfill the four default flows for projects created before seeding.
        if (!doc.flows || doc.flows.length === 0) {
            doc.flows = buildDefaultFlows();
            doc.markModified("flows");
            await doc.save();
        }
        return res.status(200).json({
            doc: {
                _id: doc._id,
                title: doc.title,
                content: doc.content,
                description: doc.description,
                attachments: doc.attachments,
                flows: doc.flows,
                coverIndex: doc.coverIndex,
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

// Load a document and confirm the current user owns it. Returns the doc, or
// sends the appropriate error response and returns null.
async function findOwnedDoc(req, res) {
    const doc = await documentModel.findById(req.params.id);
    if (!doc) {
        res.status(404).json({ message: "Document not found" });
        return null;
    }
    if (doc.owner.toString() !== req.user.id) {
        res.status(403).json({ message: "Not authorized" });
        return null;
    }
    return doc;
}

// PATCH /api/docs/:id/description — save the project description.
async function updateDescription(req, res) {
    try {
        const doc = await findOwnedDoc(req, res);
        if (!doc) return;

        doc.description = req.body.description || "";
        await doc.save();

        return res.status(200).json({
            doc: { _id: doc._id, description: doc.description },
        });
    } catch (error) {
        console.error("updateDescription error:", error);
        return res.status(500).json({ message: "Failed to update description" });
    }
}

// POST /api/docs/:id/attachments — add a file (multipart) or a link/canva/figma.
async function addAttachment(req, res) {
    try {
        const doc = await findOwnedDoc(req, res);
        if (!doc) return;

        let attachment;

        if (req.file) {
            // Uploaded file → store via ImageKit; degrade gracefully if it fails.
            let url = "";
            try {
                const uploaded = await uploadImage(
                    req.file.buffer.toString("base64"),
                    req.file.originalname,
                    "vyrix-docs/attachments"
                );
                url = uploaded?.url || "";
            } catch (e) {
                console.error("attachment upload failed (storing metadata only):", e.message);
            }
            attachment = {
                id: crypto.randomUUID(),
                type: detectFileType(req.file.mimetype, req.file.originalname),
                name: req.file.originalname,
                url,
                createdAt: new Date(),
            };
        } else {
            // Non-file attachment from JSON body (link/canva/figma, or a linked document).
            const { type, name, url, docId } = req.body;
            const allowed = ["link", "canva", "figma", "document"];
            if (!allowed.includes(type) || !url || !url.trim()) {
                return res.status(400).json({ message: "Provide a valid type and url" });
            }
            attachment = {
                id: crypto.randomUUID(),
                type,
                name: (name && name.trim()) || url,
                url: url.trim(),
                createdAt: new Date(),
            };
            // A "document" attachment links to a real TipTap doc.
            if (type === "document" && docId) attachment.docId = docId;
        }

        doc.attachments.push(attachment);
        doc.markModified("attachments");
        await doc.save();

        return res.status(201).json({ attachment });
    } catch (error) {
        console.error("addAttachment error:", error);
        return res.status(500).json({ message: "Failed to add attachment" });
    }
}

// DELETE /api/docs/:id/attachments/:attachmentId — remove an attachment.
async function removeAttachment(req, res) {
    try {
        const doc = await findOwnedDoc(req, res);
        if (!doc) return;

        const before = doc.attachments.length;
        doc.attachments = doc.attachments.filter(
            (a) => a.id !== req.params.attachmentId
        );
        if (doc.attachments.length === before) {
            return res.status(404).json({ message: "Attachment not found" });
        }
        doc.markModified("attachments");
        await doc.save();

        return res.status(200).json({ message: "Removed" });
    } catch (error) {
        console.error("removeAttachment error:", error);
        return res.status(500).json({ message: "Failed to remove attachment" });
    }
}

// POST /api/docs/:id/flows — create a new flow.
async function createFlow(req, res) {
    try {
        const doc = await findOwnedDoc(req, res);
        if (!doc) return;

        const flow = {
            id: crypto.randomUUID(),
            name: (req.body.name && req.body.name.trim()) || "New Flow",
            files: [],
            createdAt: new Date(),
        };
        doc.flows.push(flow);
        doc.markModified("flows");
        await doc.save();

        return res.status(201).json({ flow });
    } catch (error) {
        console.error("createFlow error:", error);
        return res.status(500).json({ message: "Failed to create flow" });
    }
}

// POST /api/docs/:id/flows/:flowId/files — add a file/link to a flow.
async function addFileToFlow(req, res) {
    try {
        const doc = await findOwnedDoc(req, res);
        if (!doc) return;

        const flow = doc.flows.find((f) => f.id === req.params.flowId);
        if (!flow) return res.status(404).json({ message: "Flow not found" });

        let url = req.body.url || "";
        if (req.file) {
            try {
                const uploaded = await uploadImage(
                    req.file.buffer.toString("base64"),
                    req.file.originalname,
                    "vyrix-docs/flows"
                );
                url = uploaded?.url || "";
            } catch (e) {
                console.error("flow file upload failed (storing metadata only):", e.message);
            }
        }

        const file = {
            id: crypto.randomUUID(),
            name: req.body.name || req.file?.originalname || "Untitled",
            type:
                req.body.type ||
                (req.file ? detectFileType(req.file.mimetype, req.file.originalname) : "link"),
            url,
            createdAt: new Date(),
        };
        flow.files = flow.files || [];
        flow.files.push(file);
        doc.markModified("flows");
        await doc.save();

        return res.status(201).json({ file });
    } catch (error) {
        console.error("addFileToFlow error:", error);
        return res.status(500).json({ message: "Failed to add file to flow" });
    }
}

// DELETE /api/docs/:id/flows/:flowId — remove a flow.
async function removeFlow(req, res) {
    try {
        const doc = await findOwnedDoc(req, res);
        if (!doc) return;

        const before = doc.flows.length;
        doc.flows = doc.flows.filter((f) => f.id !== req.params.flowId);
        if (doc.flows.length === before) {
            return res.status(404).json({ message: "Flow not found" });
        }
        doc.markModified("flows");
        await doc.save();

        return res.status(200).json({ message: "Deleted" });
    } catch (error) {
        console.error("removeFlow error:", error);
        return res.status(500).json({ message: "Failed to remove flow" });
    }
}

// PATCH /api/docs/:id/flows/reorder — reorder flows to match the given id order.
async function reorderFlows(req, res) {
    try {
        const doc = await findOwnedDoc(req, res);
        if (!doc) return;

        const { flowIds } = req.body;
        if (!Array.isArray(flowIds)) {
            return res.status(400).json({ message: "flowIds must be an array" });
        }
        const reordered = flowIds
            .map((fid) => doc.flows.find((f) => f.id === fid))
            .filter(Boolean);
        // Keep any flows not mentioned in flowIds (safety) at the end.
        const missing = doc.flows.filter((f) => !flowIds.includes(f.id));
        doc.flows = [...reordered, ...missing];
        doc.markModified("flows");
        await doc.save();

        return res.status(200).json({ flows: doc.flows });
    } catch (error) {
        console.error("reorderFlows error:", error);
        return res.status(500).json({ message: "Failed to reorder flows" });
    }
}

module.exports = {
    createDocument,
    getMyDocuments,
    getDocument,
    updateDocument,
    deleteDocument,
    moveDocument,
    updateDescription,
    addAttachment,
    removeAttachment,
    createFlow,
    addFileToFlow,
    removeFlow,
    reorderFlows,
};
