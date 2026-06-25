const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("vyrix", {
    // ── Auth ──────────────────────────────────────────────────────────────────
    register:       (creds)           => ipcRenderer.invoke("auth:register", creds.firstName, creds.lastName, creds.email, creds.password),
    login:          (creds)           => ipcRenderer.invoke("auth:login", creds.email, creds.password),
    loginGoogle:    ()                => ipcRenderer.invoke("auth:loginGoogle"),
    googleCallback: (accessToken)     => ipcRenderer.invoke("auth:googleCallback", accessToken),
    saveToken:      (token)           => ipcRenderer.invoke("auth:saveToken", token),
    logout:         ()                => ipcRenderer.invoke("auth:logout"),
    getMe:          ()                => ipcRenderer.invoke("auth:getMe"),
    heartbeat:      (appVersion)      => ipcRenderer.invoke("auth:heartbeat", appVersion),
    logUsage:       (counters)        => ipcRenderer.invoke("auth:logUsage", counters),
    sendFeedback:   (type, message)   => ipcRenderer.invoke("feedback:send", type, message),

    // ── Projects ──────────────────────────────────────────────────────────────
    projects: {
        list:   ()                   => ipcRenderer.invoke("projects:list"),
        listFull: ()                 => ipcRenderer.invoke("projects:listFull"),
        get:    (id)                 => ipcRenderer.invoke("projects:get", id),
        create: (parentId)           => ipcRenderer.invoke("projects:create", parentId || null),
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
        add:     (projectId, sourcePath, meta)        => ipcRenderer.invoke("attachments:add", projectId, sourcePath, meta),
        addLink: (projectId, meta)                    => ipcRenderer.invoke("attachments:addLink", projectId, meta),
        rename:  (projectId, attachmentId, name)      => ipcRenderer.invoke("attachments:rename", projectId, attachmentId, name),
        remove:  (projectId, attachmentId)            => ipcRenderer.invoke("attachments:remove", projectId, attachmentId),
    },

    // ── Flows ─────────────────────────────────────────────────────────────────
    flows: {
        create:  (projectId, name)                    => ipcRenderer.invoke("flows:create", projectId, name),
        addFile: (projectId, flowId, sourcePath, meta) => ipcRenderer.invoke("flows:addFile", projectId, flowId, sourcePath, meta),
        addLink: (projectId, flowId, meta)             => ipcRenderer.invoke("flows:addLink", projectId, flowId, meta),
        remove:  (projectId, flowId)                   => ipcRenderer.invoke("flows:remove", projectId, flowId),
        reorder: (projectId, flowIds)                  => ipcRenderer.invoke("flows:reorder", projectId, flowIds),
    },

    // ── Onboarding ────────────────────────────────────────────────────────────
    onboarding: {
        sendOtp:     ()                          => ipcRenderer.invoke("onboarding:sendOtp"),
        verifyOtp:   (otp)                       => ipcRenderer.invoke("onboarding:verifyOtp", otp),
        saveProfile: (username, profession, file) => ipcRenderer.invoke("onboarding:saveProfile", username, profession, file),
    },

    // ── Legal ─────────────────────────────────────────────────────────────────
    legal: {
        accept: (payload) => ipcRenderer.invoke("legal:accept", payload),
        status: ()        => ipcRenderer.invoke("legal:status"),
    },

    // ── Sync ──────────────────────────────────────────────────────────────────
    sync: {
        drain: () => ipcRenderer.invoke("sync:drain"),
    },

    // ── AI ────────────────────────────────────────────────────────────────────
    ai: {
        health:                   ()                         => ipcRenderer.invoke("ai:health"),
        getOrCreateConversation:  (params)                   => ipcRenderer.invoke("ai:getOrCreateConversation", params),
        getConversation:          (id)                       => ipcRenderer.invoke("ai:getConversation", id),
        listConversations:        (projectId)                => ipcRenderer.invoke("ai:listConversations", projectId),
        deleteConversation:       (id)                       => ipcRenderer.invoke("ai:deleteConversation", id),
        sendMessage:              (conversationId, message, opts) => ipcRenderer.invoke("ai:sendMessage", conversationId, message, opts),
        streamMessage:            (conversationId, message, opts) => ipcRenderer.invoke("ai:streamMessage", conversationId, message, opts),
    },

    // ── App events (renderer listens for these) ───────────────────────────────
    on: (channel, fn) => {
        const allowed = [
            "app:ready",
            "auth:deepLink",
            "ai:stream:start",
            "ai:stream:chunk",
            "ai:stream:done",
            "ai:stream:error",
        ];
        if (allowed.includes(channel)) ipcRenderer.on(channel, fn);
    },
    off: (channel, fn) => ipcRenderer.removeListener(channel, fn),
});
