const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");

const { initDB }       = require("./ipc/db");
const authIpc          = require("./ipc/auth.ipc");
const projectsIpc      = require("./ipc/projects.ipc");
const foldersIpc       = require("./ipc/folders.ipc");
const todosIpc         = require("./ipc/todos.ipc");
const attachmentsIpc   = require("./ipc/attachments.ipc");
const syncIpc          = require("./ipc/sync.ipc");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

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

    win = new BrowserWindow({
        width:  1280,
        height: 800,
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
