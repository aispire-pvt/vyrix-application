const { safeStorage, shell, app } = require("electron");
const Store  = require("electron-store");
const https  = require("https");
const http   = require("http");

const store = new Store();
const API   = process.env.API_URL || "https://vyrix-app.onrender.com";

// ── token helpers ──────────────────────────────────────────────────────────────

function saveToken(token) {
    if (!safeStorage.isEncryptionAvailable()) {
        store.set("authToken", token);
        return;
    }
    const enc = safeStorage.encryptString(token);
    store.set("authToken", enc.toString("base64"));
    store.set("authTokenEncrypted", true);
}

function getToken() {
    const raw       = store.get("authToken");
    const encrypted = store.get("authTokenEncrypted", false);
    if (!raw) return null;
    if (!encrypted || !safeStorage.isEncryptionAvailable()) return raw;
    try {
        return safeStorage.decryptString(Buffer.from(raw, "base64"));
    } catch {
        return null;
    }
}

function clearToken() {
    store.delete("authToken");
    store.delete("authTokenEncrypted");
}

// ── fetch helper ───────────────────────────────────────────────────────────────

function apiFetch(path, opts = {}) {
    return new Promise((resolve, reject) => {
        const url      = new URL(`${API}${path}`);
        const token    = getToken();
        const body     = opts.body ? JSON.stringify(opts.body) : undefined;
        const headers  = {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(opts.headers || {}),
        };

        const transport = url.protocol === "https:" ? https : http;
        const req = transport.request(
            {
                hostname: url.hostname,
                port:     url.port || (url.protocol === "https:" ? 443 : 80),
                path:     url.pathname + url.search,
                method:   opts.method || "GET",
                headers:  { ...headers, ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}) },
            },
            (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    try { resolve(JSON.parse(data)); }
                    catch { resolve(data); }
                });
            }
        );
        req.setTimeout(15_000, () => req.destroy(new Error("Request timed out")));
        req.on("error", reject);
        if (body) req.write(body);
        req.end();
    });
}

// ── ipc handlers ──────────────────────────────────────────────────────────────

function register(ipcMain) {
    ipcMain.handle("auth:register", async (_, firstName, lastName, email, password) => {
        const data = await apiFetch("/api/auth/register", {
            method: "POST",
            body:   { firstName, lastName, email, password },
        });
        if (data.accessToken) saveToken(data.accessToken);
        return data;
    });

    ipcMain.handle("auth:login", async (_, email, password) => {
        const data = await apiFetch("/api/auth/login", {
            method: "POST",
            body:   { email, password, appVersion: app.getVersion() },
        });
        if (data.accessToken) {
            saveToken(data.accessToken);
            if (data.contributorId)      store.set("contributorId",      data.contributorId);
            if (data.contributorDisplay) store.set("contributorDisplay", data.contributorDisplay);
        }
        return data;
    });

    ipcMain.handle("auth:googleCallback", async (_, accessToken) => {
        const data = await apiFetch("/api/auth/google", {
            method: "POST",
            body:   { accessToken, appVersion: app.getVersion() },
        });
        if (data.accessToken) {
            saveToken(data.accessToken);
            if (data.contributorId)      store.set("contributorId",      data.contributorId);
            if (data.contributorDisplay) store.set("contributorDisplay", data.contributorDisplay);
        }
        return data;
    });

    ipcMain.handle("auth:logout", async () => {
        clearToken();
        store.delete("contributorId");
        store.delete("contributorDisplay");
        // Clear cached legal acceptance so a different account on the same
        // machine can't inherit this user's accepted state and skip the gate.
        store.delete("legal.ndaAcceptedAt");
        store.delete("legal.termsAcceptedAt");
        store.delete("legal.privacyAcceptedAt");
        store.delete("legal.acceptedBy");
        return { ok: true };
    });

    ipcMain.handle("auth:getMe", async () => {
        return apiFetch("/api/auth/me");
    });

    ipcMain.handle("auth:heartbeat", async () => {
        try {
            const res = await apiFetch("/api/auth/heartbeat", {
                method: "POST",
                body:   { appVersion: app.getVersion() },
            });
            // Drain offline sync queue on every successful heartbeat
            const { drainQueue } = require("./sync.ipc");
            drainQueue().catch(() => {});
            return res;
        } catch {
            return { ok: false };
        }
    });

    ipcMain.handle("auth:logUsage", async (_, counters) => {
        try {
            return await apiFetch("/api/auth/usage", {
                method: "POST",
                body:   { counters, appVersion: app.getVersion() },
            });
        } catch {
            return { ok: false };
        }
    });

    ipcMain.handle("auth:loginGoogle", async () => {
        shell.openExternal(`${API}/api/auth/google-redirect`);
        return { pending: true };
    });

    // Generic feedback endpoint (avoids CORS by going through main process)
    ipcMain.handle("feedback:send", async (_, type, message) => {
        return apiFetch("/api/feedback", { method: "POST", body: { type, message } });
    });

    // Called by the renderer after the deep-link delivers the JWT
    ipcMain.handle("auth:saveToken", async (_, token) => {
        try {
            saveToken(token);
            const data = await apiFetch("/api/auth/me");
            return { success: true, ...data };
        } catch {
            return { success: false, message: "Failed to verify token" };
        }
    });

    // Legal acceptance — written locally for offline resilience, then synced to MongoDB
    ipcMain.handle("legal:accept", async (_, { nda, terms, privacy, userName }) => {
        const ts = new Date().toISOString();
        if (nda)     store.set("legal.ndaAcceptedAt",     ts);
        if (terms)   store.set("legal.termsAcceptedAt",   ts);
        if (privacy) store.set("legal.privacyAcceptedAt", ts);
        if (userName) store.set("legal.acceptedBy", userName);

        // Best-effort backend sync — don't block the UI if offline
        apiFetch("/api/auth/legal-accept", {
            method: "POST",
            body: { nda: !!nda, terms: !!terms, privacy: !!privacy },
        }).catch(() => {});

        return { ok: true, acceptedAt: ts };
    });

    ipcMain.handle("legal:status", async () => {
        // Prefer local store (instant); fall back to backend if local is empty
        const localNda     = store.get("legal.ndaAcceptedAt");
        const localTerms   = store.get("legal.termsAcceptedAt");
        const localPrivacy = store.get("legal.privacyAcceptedAt");

        if (localNda && localTerms && localPrivacy) {
            return {
                ndaAccepted: true, termsAccepted: true, privacyAccepted: true,
                acceptedAt: localNda, acceptedBy: store.get("legal.acceptedBy") || null,
            };
        }

        // Try backend (e.g. fresh install on same account)
        try {
            const data = await apiFetch("/api/auth/me");
            const user = data?.user || {};
            if (user.ndaAcceptedAt)     store.set("legal.ndaAcceptedAt",     user.ndaAcceptedAt);
            if (user.termsAcceptedAt)   store.set("legal.termsAcceptedAt",   user.termsAcceptedAt);
            if (user.privacyAcceptedAt) store.set("legal.privacyAcceptedAt", user.privacyAcceptedAt);
            return {
                ndaAccepted:     !!user.ndaAcceptedAt,
                termsAccepted:   !!user.termsAcceptedAt,
                privacyAccepted: !!user.privacyAcceptedAt,
                acceptedAt:      user.ndaAcceptedAt     || null,
                acceptedBy:      store.get("legal.acceptedBy") || null,
            };
        } catch {
            return {
                ndaAccepted:     !!localNda,
                termsAccepted:   !!localTerms,
                privacyAccepted: !!localPrivacy,
                acceptedAt:      localNda || null,
                acceptedBy:      store.get("legal.acceptedBy") || null,
            };
        }
    });
}

module.exports = { register, getToken, store, apiFetch };
