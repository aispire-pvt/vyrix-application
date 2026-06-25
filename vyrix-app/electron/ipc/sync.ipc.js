const { getDB }      = require("./db");
const { randomUUID } = require("crypto");

const API         = process.env.API_URL || "https://vyrix-app.onrender.com";
const debounceMap = new Map(); // projectId → timer handle

// ── public API ─────────────────────────────────────────────────────────────────

// Debounce a Supabase mirror for a given project (30s after last save).
function enqueueSync(projectId) {
    if (debounceMap.has(projectId)) clearTimeout(debounceMap.get(projectId));
    const t = setTimeout(() => {
        debounceMap.delete(projectId);
        flushProject(projectId).catch(() => {});
    }, 30_000);
    debounceMap.set(projectId, t);
}

// Drain the offline sync queue — called on every heartbeat.
async function drainQueue() {
    const { getToken } = require("./auth.ipc");
    const token = getToken();
    if (!token) return;

    const rows = getDB()
        .prepare(`SELECT * FROM sync_queue WHERE attempts < 5 ORDER BY created_at ASC LIMIT 20`)
        .all();

    for (const row of rows) {
        try {
            const res = await apiPost("/api/catalog/upsert", JSON.parse(row.payload), token);
            if (res.ok) {
                getDB().prepare(`DELETE FROM sync_queue WHERE id = ?`).run(row.id);
            } else {
                getDB()
                    .prepare(`UPDATE sync_queue SET attempts = attempts + 1 WHERE id = ?`)
                    .run(row.id);
            }
        } catch {
            getDB()
                .prepare(`UPDATE sync_queue SET attempts = attempts + 1 WHERE id = ?`)
                .run(row.id);
        }
    }
}

function register(ipcMain) {
    ipcMain.handle("sync:drain", () => drainQueue().catch(() => {}));
}

// ── internals ──────────────────────────────────────────────────────────────────

async function flushProject(projectId) {
    const { getToken, store } = require("./auth.ipc");
    const token = getToken();

    const row = getDB().prepare(`SELECT * FROM projects WHERE id = ?`).get(projectId);
    if (!row) return;

    const payload = {
        projectId:          row.id,
        title:              row.title,
        tiptapContent:      JSON.parse(row.content),
        contentExcerpt:     (row.description || "").slice(0, 300),
        authors:            [],
        publishers:         [],
        year:               null,
        tags:               [],
        summary:            "",
        contributorId:      store.get("contributorId")      || "",
        contributorDisplay: store.get("contributorDisplay") || "",
    };

    if (!token) {
        // Offline — persist for later retry
        getDB()
            .prepare(
                `INSERT OR REPLACE INTO sync_queue (id, type, payload, created_at, attempts)
                 VALUES (?, 'catalog', ?, ?, 0)`
            )
            .run(randomUUID(), JSON.stringify(payload), new Date().toISOString());
        return;
    }

    try {
        const res = await apiPost("/api/catalog/upsert", payload, token);
        if (!res.ok) throw new Error("non-ok response");
    } catch {
        getDB()
            .prepare(
                `INSERT OR REPLACE INTO sync_queue (id, type, payload, created_at, attempts)
                 VALUES (?, 'catalog', ?, ?, 0)`
            )
            .run(randomUUID(), JSON.stringify(payload), new Date().toISOString());
    }
}

function apiPost(path, body, token) {
    const https = require("https");
    const http  = require("http");
    const url   = new URL(`${API}${path}`);
    const data  = JSON.stringify(body);

    return new Promise((resolve, reject) => {
        const transport = url.protocol === "https:" ? https : http;
        const req = transport.request(
            {
                hostname: url.hostname,
                port:     url.port || (url.protocol === "https:" ? 443 : 80),
                path:     url.pathname,
                method:   "POST",
                headers:  {
                    "Content-Type":   "application/json",
                    "Content-Length": Buffer.byteLength(data),
                    Authorization:    `Bearer ${token}`,
                },
            },
            (res) => {
                let buf = "";
                res.on("data", (c) => (buf += c));
                res.on("end", () => {
                    try { resolve({ ok: res.statusCode < 400, ...JSON.parse(buf) }); }
                    catch { resolve({ ok: res.statusCode < 400 }); }
                });
            }
        );
        req.setTimeout(15_000, () => req.destroy(new Error("Sync request timed out")));
        req.on("error", reject);
        req.write(data);
        req.end();
    });
}

module.exports = { register, enqueueSync, drainQueue };
