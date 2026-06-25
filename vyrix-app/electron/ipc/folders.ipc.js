const { randomUUID } = require("crypto");
const { getDB }      = require("./db");

function register(ipcMain) {
    ipcMain.handle("folders:list", (_, parentId) => {
        return getDB()
            .prepare(
                `SELECT f.*,
                        (SELECT COUNT(*) FROM projects p WHERE p.folder_id = f.id AND p.parent_id IS NULL) AS doc_count
                 FROM folders f
                 WHERE f.parent_id IS ?
                 ORDER BY f.created_at DESC`
            )
            .all(parentId || null);
    });

    ipcMain.handle("folders:get", (_, id) => {
        const folder = getDB().prepare(`SELECT * FROM folders WHERE id = ?`).get(id);
        if (!folder) return null;

        const docs = getDB()
            .prepare(
                `SELECT id, title, cover_index, created_at, updated_at
                 FROM projects WHERE folder_id = ? AND parent_id IS NULL ORDER BY updated_at DESC`
            )
            .all(id);

        const subFolders = getDB()
            .prepare(
                `SELECT f.*,
                        (SELECT COUNT(*) FROM projects p WHERE p.folder_id = f.id AND p.parent_id IS NULL) AS doc_count
                 FROM folders f WHERE f.parent_id = ? ORDER BY f.created_at DESC`
            )
            .all(id);

        // Breadcrumb ancestor chain
        const ancestors = [];
        let cur = folder;
        const seen = new Set([cur.id]);
        while (cur.parent_id) {
            cur = getDB().prepare(`SELECT * FROM folders WHERE id = ?`).get(cur.parent_id);
            if (!cur || seen.has(cur.id)) break;
            ancestors.unshift({ id: cur.id, name: cur.name });
            seen.add(cur.id);
        }

        return { folder, ancestors, subFolders, docs };
    });

    ipcMain.handle("folders:create", (_, name, parentId) => {
        const id  = randomUUID();
        const now = new Date().toISOString();
        getDB()
            .prepare(
                `INSERT INTO folders (id, name, parent_id, created_at) VALUES (?, ?, ?, ?)`
            )
            .run(id, name.trim(), parentId || null, now);
        return { id, name: name.trim(), parent_id: parentId || null, created_at: now, doc_count: 0 };
    });

    ipcMain.handle("folders:rename", (_, id, name) => {
        getDB().prepare(`UPDATE folders SET name = ? WHERE id = ?`).run(name.trim(), id);
        return { id, name: name.trim() };
    });

    ipcMain.handle("folders:delete", (_, id) => {
        const folder = getDB().prepare(`SELECT * FROM folders WHERE id = ?`).get(id);
        if (!folder) return { ok: false };
        // Detach docs (don't delete them)
        getDB().prepare(`UPDATE projects SET folder_id = NULL WHERE folder_id = ?`).run(id);
        // Re-parent child folders
        getDB()
            .prepare(`UPDATE folders SET parent_id = ? WHERE parent_id = ?`)
            .run(folder.parent_id || null, id);
        getDB().prepare(`DELETE FROM folders WHERE id = ?`).run(id);
        return { ok: true };
    });
}

module.exports = { register };
