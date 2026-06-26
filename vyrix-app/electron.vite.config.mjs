import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
    main: {
        build: {
            outDir: "dist/main",
            rollupOptions: {
                input: resolve("electron/main.js"),
                external: [
                    "electron",
                    "better-sqlite3",
                    "electron-store",
                    "electron-updater",
                    "pdf-parse",
                    "mammoth",
                    /^pdf-parse\//,   // subpath import: pdf-parse/lib/pdf-parse.js
                ],
            },
        },
    },
    preload: {
        build: {
            outDir: "dist/preload",
            rollupOptions: {
                input: resolve("electron/preload.js"),
            },
        },
    },
    renderer: {
        root: ".",
        build: {
            outDir: "dist/renderer",
            rollupOptions: {
                input: resolve("index.html"),
            },
        },
        plugins: [react()],
    },
});
