const { randomUUID } = require("crypto");
const { getDB }      = require("./db");

function register(ipcMain) {
    ipcMain.handle("todos:list", () =>
        getDB().prepare(`SELECT * FROM todos ORDER BY created_at ASC`).all()
    );

    ipcMain.handle("todos:create", (_, text) => {
        const id  = randomUUID();
        const now = new Date().toISOString();
        getDB()
            .prepare(`INSERT INTO todos (id, text, done, created_at) VALUES (?, ?, 0, ?)`)
            .run(id, text.trim(), now);
        return { id, text: text.trim(), done: 0, created_at: now };
    });

    ipcMain.handle("todos:update", (_, id, patch) => {
        if (patch.text !== undefined) {
            getDB().prepare(`UPDATE todos SET text = ? WHERE id = ?`).run(patch.text.trim(), id);
        }
        if (patch.done !== undefined) {
            getDB().prepare(`UPDATE todos SET done = ? WHERE id = ?`).run(patch.done ? 1 : 0, id);
        }
        return getDB().prepare(`SELECT * FROM todos WHERE id = ?`).get(id);
    });

    ipcMain.handle("todos:delete", (_, id) => {
        getDB().prepare(`DELETE FROM todos WHERE id = ?`).run(id);
        return { ok: true };
    });
}

module.exports = { register };
