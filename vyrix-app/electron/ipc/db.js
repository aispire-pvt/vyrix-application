const Database = require("better-sqlite3");
const path     = require("path");
const { app }  = require("electron");

let db;

function initDB() {
    const dbPath = path.join(app.getPath("userData"), "vyrix.db");
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    db.exec(`
        CREATE TABLE IF NOT EXISTS folders (
            id         TEXT PRIMARY KEY,
            name       TEXT NOT NULL,
            parent_id  TEXT REFERENCES folders(id) ON DELETE SET NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS projects (
            id          TEXT PRIMARY KEY,
            title       TEXT NOT NULL DEFAULT 'Untitled',
            description TEXT NOT NULL DEFAULT '',
            content     TEXT NOT NULL DEFAULT '{}',
            cover_index INTEGER NOT NULL DEFAULT 0,
            folder_id   TEXT REFERENCES folders(id) ON DELETE SET NULL,
            flows       TEXT NOT NULL DEFAULT '[]',
            attachments TEXT NOT NULL DEFAULT '[]',
            created_at  TEXT NOT NULL,
            updated_at  TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS todos (
            id         TEXT PRIMARY KEY,
            text       TEXT NOT NULL,
            done       INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sync_queue (
            id         TEXT PRIMARY KEY,
            type       TEXT NOT NULL,
            payload    TEXT NOT NULL,
            created_at TEXT NOT NULL,
            attempts   INTEGER NOT NULL DEFAULT 0
        );
    `);
}

function getDB() {
    return db;
}

module.exports = { initDB, getDB };
