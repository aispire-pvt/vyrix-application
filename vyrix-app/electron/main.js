const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

const { initDB }       = require("./ipc/db");
const authIpc          = require("./ipc/auth.ipc");
const projectsIpc      = require("./ipc/projects.ipc");
const foldersIpc       = require("./ipc/folders.ipc");
const todosIpc         = require("./ipc/todos.ipc");
const attachmentsIpc   = require("./ipc/attachments.ipc");
const syncIpc          = require("./ipc/sync.ipc");
const onboardingIpc    = require("./ipc/onboarding.ipc");
const aiIpc            = require("./ipc/ai.ipc");
const aiSetupIpc       = require("./ipc/ai-setup.ipc");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

// Auto-updater — only active in production builds
let autoUpdater;
if (!isDev) {
    try {
        ({ autoUpdater } = require("electron-updater"));
        autoUpdater.autoDownload = true;
        autoUpdater.autoInstallOnAppQuit = true;

        autoUpdater.on("update-downloaded", (info) => {
            dialog.showMessageBox({
                type: "info",
                title: "Update ready",
                message: `Vyrix ${info.version} has been downloaded and will install when you close the app.`,
                buttons: ["Restart now", "Later"],
                defaultId: 0,
            }).then(({ response }) => {
                if (response === 0) autoUpdater.quitAndInstall();
            });
        });

        autoUpdater.on("error", (err) => {
            console.error("Auto-updater error:", err?.message);
        });
    } catch {
        // electron-updater not available — silently skip
    }
}

// Single-instance lock — required so second-instance fires on the running app
// when a vyrix:// URL is launched, instead of Windows spawning a new instance.
if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

// Register deep-link protocol for Google OAuth callback
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient("vyrix", process.execPath, [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient("vyrix");
}

let win;
let pendingDeepLink = null;

function handleDeepLink(url) {
    if (!url) return;
    try {
        const parsed = new URL(url);
        if (parsed.pathname === "//auth" || parsed.host === "auth") {
            const token = parsed.searchParams.get("token");
            const error = parsed.searchParams.get("error");
            const payload = { token, error };
            if (win && win.webContents && !win.webContents.isLoading()) {
                win.webContents.send("auth:deepLink", payload);
                if (win.isMinimized()) win.restore();
                win.focus();
            } else {
                pendingDeepLink = payload;
            }
        }
    } catch {}
}

// macOS — protocol delivered via open-url
app.on("open-url", (_, url) => handleDeepLink(url));

// Windows / Linux — protocol delivered as argv to a second instance
app.on("second-instance", (_, argv) => {
    const url = argv.find((a) => typeof a === "string" && a.startsWith("vyrix://"));
    if (url) handleDeepLink(url);
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
});

// First-launch case — protocol URL is in our own argv
const firstLaunchUrl = process.argv.find((a) => typeof a === "string" && a.startsWith("vyrix://"));
if (firstLaunchUrl) pendingDeepLink = { __pendingUrl: firstLaunchUrl };

// Try to start Ollama if it isn't already running. Silently ignored if:
//   - Ollama isn't installed (ENOENT)
//   - It's already running (port conflict — Ollama exits immediately)
//   - macOS/Windows auto-started it at login
function tryStartOllama() {
    // Resolve the real install path (not just PATH) so a freshly-installed
    // Ollama starts even though the running process's PATH predates the install.
    let bin = "ollama";
    try { bin = aiSetupIpc.resolveOllamaBin(); } catch {}
    const proc = spawn(bin, ["serve"], {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
    });
    proc.unref(); // don't keep the Electron process alive for Ollama
    proc.on("error", () => {}); // ENOENT = not installed, silently ignore
}

app.whenReady().then(() => {
    tryStartOllama();
    initDB();
    authIpc.register(ipcMain);
    projectsIpc.register(ipcMain);
    foldersIpc.register(ipcMain);
    todosIpc.register(ipcMain);
    attachmentsIpc.register(ipcMain);
    syncIpc.register(ipcMain);
    onboardingIpc.register(ipcMain);
    aiIpc.register(ipcMain);
    aiSetupIpc.register(ipcMain);
    createWindow();

    // Check for updates 5s after launch so the window is ready
    if (autoUpdater) setTimeout(() => autoUpdater.checkForUpdatesAndNotify(), 5000);
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

function createWindow() {
    win = new BrowserWindow({
        show: false, minWidth: 900, minHeight: 600,
        webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false, sandbox: true },
    });
    win.setMenuBarVisibility(false);
    win.maximize();
    win.show();
    if (isDev) { win.loadURL("http://localhost:5173"); }
    else { win.loadFile(path.join(__dirname, "../dist/renderer/index.html")); }
    win.webContents.once("did-finish-load", () => {
        win.webContents.send("app:ready", { version: app.getVersion() });
        if (pendingDeepLink) {
            if (pendingDeepLink.__pendingUrl) handleDeepLink(pendingDeepLink.__pendingUrl);
            else win.webContents.send("auth:deepLink", pendingDeepLink);
            pendingDeepLink = null;
        }
    });
}

// Open external links in the system browser, not inside Electron
app.on("web-contents-created", (_, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });
});
