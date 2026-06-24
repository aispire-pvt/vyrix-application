const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");

const { initDB }       = require("./ipc/db");
const authIpc          = require("./ipc/auth.ipc");
const projectsIpc      = require("./ipc/projects.ipc");
const foldersIpc       = require("./ipc/folders.ipc");
const todosIpc         = require("./ipc/todos.ipc");
const attachmentsIpc   = require("./ipc/attachments.ipc");
const syncIpc          = require("./ipc/sync.ipc");
const onboardingIpc    = require("./ipc/onboarding.ipc");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

// Register deep-link protocol for Google OAuth callback
if (process.defaultApp) {
    if (process.argv.length >= 2) app.setAsDefaultProtocolClient("vyrix", process.execPath, [path.resolve(process.argv[1])]);
} else {
    app.setAsDefaultProtocolClient("vyrix");
}

function handleDeepLink(url) {
    if (!win || !url) return;
    try {
        const parsed = new URL(url);
        if (parsed.pathname === "//auth" || parsed.host === "auth") {
            const token = parsed.searchParams.get("token");
            const error = parsed.searchParams.get("error");
            win.webContents.send("auth:deepLink", { token, error });
            win.focus();
        }
    } catch {}
}

app.on("open-url", (_, url) => handleDeepLink(url));         // macOS
app.on("second-instance", (_, argv) => {
    const url = argv.find(a => a.startsWith("vyrix://"));
    if (url) handleDeepLink(url);
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
});

let win;

app.whenReady().then(() => {
    // Init SQLite before any IPC handler runs
    initDB();

    // Register all IPC handlers
    authIpc.register(ipcMain);
    projectsIpc.register(ipcMain);
    foldersIpc.register(ipcMain);
    todosIpc.register(ipcMain);
    attachmentsIpc.register(ipcMain);
    syncIpc.register(ipcMain);
    onboardingIpc.register(ipcMain);

    win = new BrowserWindow({
        show:      false,
        minWidth:  900,
        minHeight: 600,
        webPreferences: {
            preload:          path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration:  false,
            sandbox:          true,
        },
    });

    win.setMenuBarVisibility(false);
    win.maximize();
    win.show();

    if (isDev) {
        win.loadURL("http://localhost:5173");
    } else {
        win.loadFile(path.join(__dirname, "../dist/renderer/index.html"));
    }

    // Send heartbeat on every launch
    win.webContents.once("did-finish-load", () => {
        win.webContents.send("app:ready", { version: app.getVersion() });
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) app.whenReady().then(() => {});
});

// Open external links in the system browser, not inside Electron
app.on("web-contents-created", (_, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });
});
