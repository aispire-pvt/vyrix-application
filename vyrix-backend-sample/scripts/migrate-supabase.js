// Run once: node scripts/migrate-supabase.js
// Uses Supabase Management API to execute DDL.
require("dotenv").config();
const https = require("https");

// Extract project ref from SUPABASE_URL (e.g. bdvzigchkstyavvdvvlx)
const projectRef = process.env.SUPABASE_URL.replace("https://", "").split(".")[0];
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

const sql = `
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS catalog_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    local_project_id TEXT NOT NULL,
    contributor_id TEXT NOT NULL,
    contributor_display TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL DEFAULT 'Untitled',
    authors TEXT[] NOT NULL DEFAULT '{}',
    publishers TEXT[] NOT NULL DEFAULT '{}',
    year INT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    summary TEXT NOT NULL DEFAULT '',
    content_excerpt TEXT NOT NULL DEFAULT '',
    tiptap_content JSONB NOT NULL DEFAULT '{}',
    summary_embedding VECTOR(1536),
    visibility TEXT NOT NULL DEFAULT 'private',
    status TEXT NOT NULL DEFAULT 'draft',
    slug TEXT UNIQUE,
    view_count INT NOT NULL DEFAULT 0,
    generated_by TEXT,
    binary_storage_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (local_project_id, contributor_id)
);

CREATE INDEX IF NOT EXISTS catalog_contributor_idx ON catalog_entries (contributor_id);
CREATE INDEX IF NOT EXISTS catalog_visibility_status_idx ON catalog_entries (visibility, status);
CREATE INDEX IF NOT EXISTS catalog_tags_gin ON catalog_entries USING GIN (tags);
CREATE INDEX IF NOT EXISTS catalog_summary_fts ON catalog_entries USING GIN (to_tsvector('english', summary));
`;

function post(path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const req = https.request({
            hostname: "api.supabase.com",
            path,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
                "Authorization": `Bearer ${serviceKey}`,
            },
        }, (res) => {
            let raw = "";
            res.on("data", (c) => raw += c);
            res.on("end", () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
                catch { resolve({ status: res.statusCode, body: raw }); }
            });
        });
        req.on("error", reject);
        req.write(data);
        req.end();
    });
}

async function run() {
    console.log(`Running migration on project: ${projectRef}`);
    const result = await post(
        `/v1/projects/${projectRef}/database/query`,
        { query: sql }
    );
    if (result.status >= 400) {
        console.error("Migration failed:", JSON.stringify(result.body, null, 2));
        process.exit(1);
    }
    console.log("Migration succeeded:", JSON.stringify(result.body, null, 2));
}

run().catch((err) => { console.error(err); process.exit(1); });
