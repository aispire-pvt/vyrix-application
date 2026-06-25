const { createClient } = require("@supabase/supabase-js");

function getSupabase() {
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
    );
}

// POST /api/catalog/upsert
// Called by Electron main process on debounced save.
// Mirrors structured project content to Supabase as backup + future catalog entry.
async function upsertCatalog(req, res) {
    try {
        const {
            projectId,
            title,
            authors,
            publishers,
            year,
            tags,
            summary,
            contentExcerpt,
            tiptapContent,
            contributorId,
            contributorDisplay,
            generatedBy,
        } = req.body;

        if (!projectId || !contributorId) {
            return res.status(400).json({ message: "projectId and contributorId are required" });
        }

        const supabase = getSupabase();

        const { error } = await supabase
            .from("catalog_entries")
            .upsert(
                {
                    local_project_id:    projectId,
                    contributor_id:      contributorId,
                    contributor_display: contributorDisplay || "",
                    title:               title || "Untitled",
                    authors:             authors      || [],
                    publishers:          publishers   || [],
                    year:                year         || null,
                    tags:                tags         || [],
                    summary:             summary      || "",
                    content_excerpt:     contentExcerpt || "",
                    tiptap_content:      tiptapContent  || {},
                    visibility:          "private",
                    status:              "draft",
                    generated_by:        generatedBy  || null,
                    updated_at:          new Date().toISOString(),
                },
                { onConflict: "local_project_id,contributor_id" }
            );

        if (error) {
            console.error("upsertCatalog supabase error:", error);
            return res.status(500).json({ message: "Catalog sync failed", detail: error.message });
        }

        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error("upsertCatalog error:", error);
        return res.status(500).json({ message: "Catalog sync failed" });
    }
}

module.exports = { upsertCatalog };
