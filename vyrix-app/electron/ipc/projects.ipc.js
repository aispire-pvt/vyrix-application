const { randomUUID } = require("crypto");
const { getDB }      = require("./db");
const { app }        = require("electron");
const fs             = require("fs");
const path           = require("path");
const { enqueueSync } = require("./sync.ipc");

const DEFAULT_FLOW_NAMES = [
    "Pre Research",
    "Interview and surveys",
    "Research Materials",
    "Research Papers",
];

function buildDefaultFlows() {
    return DEFAULT_FLOW_NAMES.map((name) => ({
        id:        randomUUID(),
        name,
        files:     [],
        isDefault: true,
        createdAt: new Date().toISOString(),
    }));
}

function register(ipcMain) {
    ipcMain.handle("projects:list", () => {
        return getDB()
            .prepare(
                `SELECT id, title, cover_index, folder_id, created_at, updated_at
                 FROM projects WHERE parent_id IS NULL ORDER BY updated_at DESC`
            )
            .all();
    });

    // Full rows with attachments + flows parsed — for Repo / AllFiles aggregation
    ipcMain.handle("projects:listFull", () => {
        const rows = getDB()
            .prepare(`SELECT * FROM projects WHERE parent_id IS NULL ORDER BY updated_at DESC`)
            .all();
        return rows.map((row) => ({
            ...row,
            content:     JSON.parse(row.content),
            flows:       JSON.parse(row.flows),
            attachments: JSON.parse(row.attachments),
        }));
    });

    ipcMain.handle("projects:get", (_, id) => {
        const row = getDB().prepare(`SELECT * FROM projects WHERE id = ?`).get(id);
        if (!row) return null;
        return {
            ...row,
            content:     JSON.parse(row.content),
            flows:       JSON.parse(row.flows),
            attachments: JSON.parse(row.attachments),
        };
    });

    ipcMain.handle("projects:create", (_, parentId) => {
        const id         = randomUUID();
        const now        = new Date().toISOString();
        const coverIndex = Math.floor(Math.random() * 4);
        const flows      = JSON.stringify(parentId ? [] : buildDefaultFlows());

        getDB()
            .prepare(
                `INSERT INTO projects
                 (id, title, description, content, cover_index, parent_id, flows, attachments, created_at, updated_at)
                 VALUES (?, 'Untitled', '', '{}', ?, ?, ?, '[]', ?, ?)`
            )
            .run(id, coverIndex, parentId || null, flows, now, now);

        return { id, title: "Untitled", cover_index: coverIndex, updated_at: now };
    });

    ipcMain.handle("projects:save", (_, id, patch) => {
        const now = new Date().toISOString();
        const row = getDB().prepare(`SELECT * FROM projects WHERE id = ?`).get(id);
        if (!row) return null;

        const title       = patch.title       !== undefined ? patch.title       : row.title;
        const description = patch.description !== undefined ? patch.description : row.description;
        const content     = patch.content     !== undefined ? JSON.stringify(patch.content) : row.content;

        getDB()
            .prepare(
                `UPDATE projects SET title = ?, description = ?, content = ?, updated_at = ? WHERE id = ?`
            )
            .run(title, description, content, now, id);

        // Debounced mirror to Supabase (30s)
        enqueueSync(id);

        return { id, updated_at: now };
    });

    ipcMain.handle("projects:delete", (_, id) => {
        getDB().prepare(`DELETE FROM projects WHERE id = ?`).run(id);
        const dir = path.join(app.getPath("userData"), "Vyrix", "projects", id);
        fs.rmSync(dir, { recursive: true, force: true });
        return { ok: true };
    });

    ipcMain.handle("projects:move", (_, id, folderId) => {
        getDB()
            .prepare(`UPDATE projects SET folder_id = ? WHERE id = ?`)
            .run(folderId || null, id);
        return { ok: true };
    });
}

module.exports = { register };
