const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("vyrix", {
    // ── Auth ──────────────────────────────────────────────────────────────────
    login:          (email, password) => ipcRenderer.invoke("auth:login", email, password),
    loginGoogle:    ()                => ipcRenderer.invoke("auth:loginGoogle"),
    googleCallback: (accessToken)     => ipcRenderer.invoke("auth:googleCallback", accessToken),
    logout:         ()                => ipcRenderer.invoke("auth:logout"),
    getMe:          ()                => ipcRenderer.invoke("auth:getMe"),
    heartbeat:      (appVersion)      => ipcRenderer.invoke("auth:heartbeat", appVersion),
    logUsage:       (counters)        => ipcRenderer.invoke("auth:logUsage", counters),

    // ── Projects ──────────────────────────────────────────────────────────────
    projects: {
        list:   ()                   => ipcRenderer.invoke("projects:list"),
        get:    (id)                 => ipcRenderer.invoke("projects:get", id),
        create: ()                   => ipcRenderer.invoke("projects:create"),
        save:   (id, patch)          => ipcRenderer.invoke("projects:save", id, patch),
        delete: (id)                 => ipcRenderer.invoke("projects:delete", id),
        move:   (id, folderId)       => ipcRenderer.invoke("projects:move", id, folderId),
    },

    // ── Folders ───────────────────────────────────────────────────────────────
    folders: {
        list:   (parentId)           => ipcRenderer.invoke("folders:list", parentId),
        get:    (id)                 => ipcRenderer.invoke("folders:get", id),
        create: (name, parentId)     => ipcRenderer.invoke("folders:create", name, parentId),
        rename: (id, name)           => ipcRenderer.invoke("folders:rename", id, name),
        delete: (id)                 => ipcRenderer.invoke("folders:delete", id),
    },

    // ── Todos ─────────────────────────────────────────────────────────────────
    todos: {
        list:   ()                   => ipcRenderer.invoke("todos:list"),
        create: (text)               => ipcRenderer.invoke("todos:create", text),
        update: (id, patch)          => ipcRenderer.invoke("todos:update", id, patch),
        delete: (id)                 => ipcRenderer.invoke("todos:delete", id),
    },

    // ── Attachments ───────────────────────────────────────────────────────────
    attachments: {
        add:     (projectId, sourcePath, meta) => ipcRenderer.invoke("attachments:add", projectId, sourcePath, meta),
        addLink: (projectId, meta)             => ipcRenderer.invoke("attachments:addLink", projectId, meta),
        remove:  (projectId, attachmentId)     => ipcRenderer.invoke("attachments:remove", projectId, attachmentId),
    },

    // ── Flows ─────────────────────────────────────────────────────────────────
    flows: {
        create:  (projectId, name)                    => ipcRenderer.invoke("flows:create", projectId, name),
        addFile: (projectId, flowId, sourcePath, meta) => ipcRenderer.invoke("flows:addFile", projectId, flowId, sourcePath, meta),
        addLink: (projectId, flowId, meta)             => ipcRenderer.invoke("flows:addLink", projectId, flowId, meta),
        remove:  (projectId, flowId)                   => ipcRenderer.invoke("flows:remove", projectId, flowId),
        reorder: (projectId, flowIds)                  => ipcRenderer.invoke("flows:reorder", projectId, flowIds),
    },

    // ── Sync ──────────────────────────────────────────────────────────────────
    sync: {
        drain: () => ipcRenderer.invoke("sync:drain"),
    },

    // ── App events (renderer listens for these) ───────────────────────────────
    on: (channel, fn) => {
        const allowed = ["app:ready"];
        if (allowed.includes(channel)) ipcRenderer.on(channel, fn);
    },
    off: (channel, fn) => ipcRenderer.removeListener(channel, fn),
});
