const { randomUUID } = require("crypto");
const { getDB }      = require("./db");
const { app }        = require("electron");
const fs             = require("fs");
const path           = require("path");

function detectType(name = "") {
    const ext = (name.split(".").pop() || "").toLowerCase();
    if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "heic"].includes(ext)) return "image";
    if (ext === "pdf")                         return "pdf";
    if (["doc", "docx"].includes(ext))         return "word";
    if (["ppt", "pptx"].includes(ext))         return "ppt";
    if (["xls", "xlsx", "csv"].includes(ext))  return "excel";
    if (["txt", "md", "rtf"].includes(ext))    return "text";
    return "file";
}

function attachmentsDir(projectId) {
    const dir = path.join(app.getPath("userData"), "Vyrix", "projects", projectId, "attachments");
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

function flowsDir(projectId, flowId) {
    const dir = path.join(app.getPath("userData"), "Vyrix", "projects", projectId, "flows", flowId);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

function readAttachments(projectId) {
    const row = getDB().prepare(`SELECT attachments FROM projects WHERE id = ?`).get(projectId);
    return row ? JSON.parse(row.attachments) : [];
}

function writeAttachments(projectId, list) {
    getDB()
        .prepare(`UPDATE projects SET attachments = ? WHERE id = ?`)
        .run(JSON.stringify(list), projectId);
}

function readFlows(projectId) {
    const row = getDB().prepare(`SELECT flows FROM projects WHERE id = ?`).get(projectId);
    return row ? JSON.parse(row.flows) : [];
}

function writeFlows(projectId, list) {
    getDB()
        .prepare(`UPDATE projects SET flows = ?, updated_at = ? WHERE id = ?`)
        .run(JSON.stringify(list), new Date().toISOString(), projectId);
}

function register(ipcMain) {
    // ── Attachments ────────────────────────────────────────────────────────────

    // sourcePath = absolute path the user picked from dialog
    ipcMain.handle("attachments:add", (_, projectId, sourcePath, meta) => {
        const id   = randomUUID();
        const name = meta?.name || path.basename(sourcePath);
        const dest = path.join(attachmentsDir(projectId), `${id}_${name}`);
        fs.copyFileSync(sourcePath, dest);

        const attachment = {
            id,
            name,
            type:      detectType(name),
            localPath: dest,
            url:       `local://${dest}`,
            createdAt: new Date().toISOString(),
        };

        const list = readAttachments(projectId);
        list.push(attachment);
        writeAttachments(projectId, list);
        return attachment;
    });

    // For links, canva, figma, document refs — no file copy
    ipcMain.handle("attachments:addLink", (_, projectId, meta) => {
        const attachment = { id: randomUUID(), ...meta, createdAt: new Date().toISOString() };
        const list = readAttachments(projectId);
        list.push(attachment);
        writeAttachments(projectId, list);
        return attachment;
    });

    ipcMain.handle("attachments:rename", (_, projectId, attachmentId, name) => {
        const list = readAttachments(projectId);
        const att  = list.find((a) => a.id === attachmentId);
        if (att) att.name = name;
        writeAttachments(projectId, list);
        return { ok: true };
    });

    ipcMain.handle("attachments:remove", (_, projectId, attachmentId) => {
        const list = readAttachments(projectId);
        const att  = list.find((a) => a.id === attachmentId);
        if (att?.localPath) {
            try { fs.unlinkSync(att.localPath); } catch {}
        }
        writeAttachments(projectId, list.filter((a) => a.id !== attachmentId));
        return { ok: true };
    });

    // ── Flows ──────────────────────────────────────────────────────────────────

    ipcMain.handle("flows:create", (_, projectId, name) => {
        const flow = {
            id:        randomUUID(),
            name:      (name || "New Flow").trim(),
            files:     [],
            createdAt: new Date().toISOString(),
        };
        const list = readFlows(projectId);
        list.push(flow);
        writeFlows(projectId, list);
        return flow;
    });

    ipcMain.handle("flows:addFile", (_, projectId, flowId, sourcePath, meta) => {
        const id   = randomUUID();
        const name = meta?.name || path.basename(sourcePath);
        const dest = path.join(flowsDir(projectId, flowId), `${id}_${name}`);
        fs.copyFileSync(sourcePath, dest);

        const file = {
            id,
            name,
            type:      detectType(name),
            localPath: dest,
            url:       `local://${dest}`,
            createdAt: new Date().toISOString(),
        };

        const list = readFlows(projectId);
        const flow = list.find((f) => f.id === flowId);
        if (flow) {
            flow.files = flow.files || [];
            flow.files.push(file);
        }
        writeFlows(projectId, list);
        return file;
    });

    ipcMain.handle("flows:addLink", (_, projectId, flowId, meta) => {
        const file = { id: randomUUID(), ...meta, createdAt: new Date().toISOString() };
        const list = readFlows(projectId);
        const flow = list.find((f) => f.id === flowId);
        if (flow) {
            flow.files = flow.files || [];
            flow.files.push(file);
        }
        writeFlows(projectId, list);
        return file;
    });

    ipcMain.handle("flows:remove", (_, projectId, flowId) => {
        writeFlows(projectId, readFlows(projectId).filter((f) => f.id !== flowId));
        // Clean up files on disk for this flow
        const dir = path.join(app.getPath("userData"), "Vyrix", "projects", projectId, "flows", flowId);
        try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
        return { ok: true };
    });

    ipcMain.handle("flows:reorder", (_, projectId, flowIds) => {
        const list      = readFlows(projectId);
        const reordered = flowIds.map((fid) => list.find((f) => f.id === fid)).filter(Boolean);
        const missing   = list.filter((f) => !flowIds.includes(f.id));
        const final     = [...reordered, ...missing];
        writeFlows(projectId, final);
        return final;
    });
}

module.exports = { register };
