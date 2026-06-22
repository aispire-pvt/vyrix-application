const folderModel = require("../models/folder.model");
const documentModel = require("../models/document.model");

// Count documents directly inside a folder for a user.
function countDocs(folderId, userId) {
    return documentModel.countDocuments({ folder: folderId, owner: userId });
}

// POST /api/folders — create a folder owned by the current user.
// Optional `parent` nests it inside another folder (must be owned by the user).
async function createFolder(req, res) {
    try {
        const { name, parent } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Folder name is required" });
        }

        let parentId = null;
        if (parent) {
            const parentFolder = await folderModel.findById(parent);
            if (!parentFolder || parentFolder.owner.toString() !== req.user.id) {
                return res.status(400).json({ message: "Invalid parent folder" });
            }
            parentId = parentFolder._id;
        }

        const folder = await folderModel.create({
            name: name.trim(),
            owner: req.user.id,
            parent: parentId,
        });
        return res.status(201).json({
            folder: {
                _id: folder._id,
                name: folder.name,
                parent: folder.parent,
                createdAt: folder.createdAt,
                docCount: 0,
            },
        });
    } catch (error) {
        console.error("createFolder error:", error);
        return res.status(500).json({ message: "Failed to create folder" });
    }
}

// GET /api/folders — list the user's folders with a document count each.
// Defaults to top-level folders (parent: null). Pass ?parent=<id> for a folder's children.
async function getMyFolders(req, res) {
    try {
        const filter = { owner: req.user.id };
        filter.parent = req.query.parent ? req.query.parent : null;

        const folders = await folderModel.find(filter).sort({ createdAt: -1 });

        const withCounts = await Promise.all(
            folders.map(async (f) => ({
                _id: f._id,
                name: f.name,
                parent: f.parent,
                createdAt: f.createdAt,
                docCount: await countDocs(f._id, req.user.id),
            }))
        );

        return res.status(200).json({ folders: withCounts });
    } catch (error) {
        console.error("getMyFolders error:", error);
        return res.status(500).json({ message: "Failed to fetch folders" });
    }
}

// GET /api/folders/:id/docs — a folder's contents: its sub-folders, its documents,
// and the ancestor chain (for the breadcrumb).
async function getFolderDocs(req, res) {
    try {
        const folder = await folderModel.findById(req.params.id);
        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }
        if (folder.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Sub-folders nested directly under this folder, each with a doc count.
        const childFolders = await folderModel
            .find({ parent: folder._id, owner: req.user.id })
            .sort({ createdAt: -1 });
        const subFolders = await Promise.all(
            childFolders.map(async (f) => ({
                _id: f._id,
                name: f.name,
                parent: f.parent,
                createdAt: f.createdAt,
                docCount: await countDocs(f._id, req.user.id),
            }))
        );

        // Documents directly inside this folder.
        const docs = await documentModel
            .find({ folder: folder._id, owner: req.user.id })
            .select("_id title coverIndex createdAt updatedAt")
            .sort({ updatedAt: -1 });

        // Ancestor chain (root → immediate parent) for the breadcrumb.
        const ancestors = [];
        let current = folder;
        const seen = new Set([folder._id.toString()]); // guard against cycles
        while (current.parent) {
            const p = await folderModel.findById(current.parent);
            if (!p || p.owner.toString() !== req.user.id || seen.has(p._id.toString())) break;
            ancestors.unshift({ _id: p._id, name: p.name });
            seen.add(p._id.toString());
            current = p;
        }

        return res.status(200).json({
            folder: { _id: folder._id, name: folder.name, parent: folder.parent },
            ancestors,
            subFolders,
            docs,
        });
    } catch (error) {
        console.error("getFolderDocs error:", error);
        return res.status(500).json({ message: "Failed to fetch folder documents" });
    }
}

// PATCH /api/folders/:id — rename a folder.
async function renameFolder(req, res) {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Folder name is required" });
        }
        const folder = await folderModel.findById(req.params.id);
        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }
        if (folder.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }
        folder.name = name.trim();
        await folder.save();
        return res.status(200).json({ folder: { _id: folder._id, name: folder.name } });
    } catch (error) {
        console.error("renameFolder error:", error);
        return res.status(500).json({ message: "Failed to rename folder" });
    }
}

// DELETE /api/folders/:id — delete a folder and detach its documents.
async function deleteFolder(req, res) {
    try {
        const folder = await folderModel.findById(req.params.id);
        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }
        if (folder.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }
        // Detach docs from this folder (don't delete the documents)
        await documentModel.updateMany(
            { folder: folder._id, owner: req.user.id },
            { folder: null }
        );
        // Re-parent any sub-folders up to this folder's parent (don't orphan them)
        await folderModel.updateMany(
            { parent: folder._id, owner: req.user.id },
            { parent: folder.parent || null }
        );
        await folder.deleteOne();
        return res.status(200).json({ message: "Deleted" });
    } catch (error) {
        console.error("deleteFolder error:", error);
        return res.status(500).json({ message: "Failed to delete folder" });
    }
}

module.exports = {
    createFolder,
    getMyFolders,
    getFolderDocs,
    renameFolder,
    deleteFolder,
};
