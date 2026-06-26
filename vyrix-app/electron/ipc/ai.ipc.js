/**
 * AI IPC handlers — ported from the vyrix-ai module.
 * Uses Node.js's built-in `http` module (NOT fetch) for all Ollama communication
 * so streaming is guaranteed to work in Electron's main process on any version.
 *
 * IPC channels (ipcMain.handle):
 *   ai:health                   → health check against Ollama
 *   ai:getOrCreateConversation  → get or create a conversation
 *   ai:getConversation          → fetch conversation + messages
 *   ai:listConversations        → list conversations for a project
 *   ai:deleteConversation       → delete a conversation and its messages
 *   ai:sendMessage              → blocking send (returns full response)
 *   ai:streamMessage            → streaming; pushes events to renderer
 *
 * Streaming events pushed via event.sender.send:
 *   ai:stream:start  { requestId, conversationId, messageId }
 *   ai:stream:chunk  { requestId, conversationId, messageId, delta }
 *   ai:stream:done   { requestId, conversationId, messageId, message }
 *   ai:stream:error  { requestId, error }
 */

const { randomUUID } = require('crypto')
const { app }        = require('electron')
const http           = require('http')
const path           = require('path')
const Database       = require('better-sqlite3')
const fs             = require('fs')

// ── Configuration ─────────────────────────────────────────────────────────
const OLLAMA_BASE_URL   = process.env.OLLAMA_BASE_URL   || 'http://127.0.0.1:11434'
const DEFAULT_MODEL     = process.env.DEFAULT_CHAT_MODEL || 'llama3.2:3b'
const HISTORY_LIMIT     = 20
const HEALTH_TIMEOUT_MS = 5_000
const CHAT_TIMEOUT_MS   = 120_000
const DEFAULT_NUM_CTX   = 4096          // window for the in-editor chatbot; /ai page overrides higher
const MAX_EXTRACT_CHARS = 200_000       // hard cap on extracted file text returned over IPC
const EMBED_MODEL       = process.env.EMBED_MODEL || 'nomic-embed-text'  // local 768-dim embeddings
const META_TIMEOUT_MS   = 30_000        // short timeout for best-effort background metadata/embedding

const SYSTEM_PROMPT = [
  'You are Vyrix, a local AI research assistant built exclusively for PhD students and academic researchers.',
  'You assist ONLY with research-related tasks: literature review, paper comprehension and critique, methodology assessment, statistical interpretation, experimental design, research planning, academic writing, thesis structure, peer review, and research ethics.',
  'STRICT SCOPE: Refuse any request outside academic research. When refused, respond exactly: "I am a research-only assistant. I cannot help with that. Please ask a research-related question."',
  'CITATION POLICY: Never invent paper titles, author names, DOIs, journal names, years, or statistics. If the answer requires a source not in the provided context, state precisely what is missing and ask the user to supply it.',
  'RESPONSE FORMAT: Use ## headings for multi-part answers. Use numbered lists for ordered steps; bullet points for unordered items.',
  'TONE: Be precise and calibrated. Write "the evidence suggests" not "it is clear". Acknowledge uncertainty directly.',
].join('\n')

// ── HTTP helpers (Node.js built-in — works reliably in all Electron versions) ──

/**
 * Parse the Ollama base URL into { hostname, port, basePath }.
 */
function parseOllamaUrl() {
  try {
    const u = new URL(OLLAMA_BASE_URL)
    return {
      hostname: u.hostname,
      port:     parseInt(u.port || '11434', 10),
      basePath: u.pathname.replace(/\/$/, ''),
    }
  } catch {
    return { hostname: '127.0.0.1', port: 11434, basePath: '' }
  }
}

/**
 * GET request, returns { ok, status, body } synchronously as a Promise.
 */
function httpGet(urlPath, timeoutMs = HEALTH_TIMEOUT_MS) {
  const { hostname, port, basePath } = parseOllamaUrl()
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname, port, path: basePath + urlPath, method: 'GET' },
      (res) => {
        let raw = ''
        res.on('data', (chunk) => { raw += chunk.toString() })
        res.on('end', () => {
          try { resolve({ ok: res.statusCode < 300, status: res.statusCode, body: JSON.parse(raw) }) }
          catch { resolve({ ok: res.statusCode < 300, status: res.statusCode, body: raw }) }
        })
      }
    )
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`GET ${urlPath} timed out`)))
    req.on('error', reject)
    req.end()
  })
}

/**
 * POST request (non-streaming), returns { ok, status, body } as a Promise.
 */
function httpPost(urlPath, payload, timeoutMs = CHAT_TIMEOUT_MS) {
  const { hostname, port, basePath } = parseOllamaUrl()
  const body = JSON.stringify(payload)
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname, port,
        path:    basePath + urlPath,
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      },
      (res) => {
        let raw = ''
        res.on('data', (chunk) => { raw += chunk.toString() })
        res.on('end', () => {
          try { resolve({ ok: res.statusCode < 300, status: res.statusCode, body: JSON.parse(raw) }) }
          catch { resolve({ ok: res.statusCode < 300, status: res.statusCode, body: raw }) }
        })
      }
    )
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`POST ${urlPath} timed out`)))
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

/**
 * POST request with NDJSON streaming (Ollama's stream=true format).
 * Calls onLine(parsedObject) for each complete JSON line received.
 * Calls onEnd() when the response closes.
 * Calls onError(err) on network/parse failure.
 * Returns the underlying http.ClientRequest so the caller can abort().
 */
function httpPostStream(urlPath, payload, onLine, onEnd, onError) {
  const { hostname, port, basePath } = parseOllamaUrl()
  const body = JSON.stringify(payload)
  let buffer = ''
  let ended  = false

  const req = http.request(
    {
      hostname, port,
      path:    basePath + urlPath,
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    },
    (res) => {
      if (res.statusCode >= 400) {
        let errBody = ''
        res.on('data', (c) => { errBody += c.toString() })
        res.on('end', () => onError(new Error(`Ollama error ${res.statusCode}: ${errBody}`)))
        return
      }

      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        buffer += chunk
        // Process all complete lines
        let newlineIdx
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIdx).trim()
          buffer = buffer.slice(newlineIdx + 1)
          if (!line) continue
          try { onLine(JSON.parse(line)) }
          catch { /* skip malformed line */ }
        }
      })
      res.on('end', () => {
        // Flush any remaining content without a trailing newline
        if (buffer.trim()) {
          try { onLine(JSON.parse(buffer.trim())) } catch {}
          buffer = ''
        }
        if (!ended) { ended = true; onEnd() }
      })
      res.on('error', (err) => { if (!ended) { ended = true; onError(err) } })
    }
  )
  req.setTimeout(CHAT_TIMEOUT_MS, () => req.destroy(new Error('Ollama stream timed out')))
  req.on('error', (err) => { if (!ended) { ended = true; onError(err) } })
  req.write(body)
  req.end()
  return req
}

// ── Database ──────────────────────────────────────────────────────────────
let aiDb = null

function getAiDb() {
  if (!aiDb) {
    const dbDir  = path.join(app.getPath('userData'), 'Vyrix')
    fs.mkdirSync(dbDir, { recursive: true })
    const dbPath = path.join(dbDir, 'vyrix-ai.db')
    aiDb         = new Database(dbPath)
    aiDb.pragma('journal_mode = WAL')
    aiDb.pragma('foreign_keys = ON')
    aiDb.exec(`
      CREATE TABLE IF NOT EXISTS ai_projects (
        id         TEXT PRIMARY KEY,
        name       TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id              TEXT PRIMARY KEY,
        project_id      TEXT,
        title           TEXT NOT NULL,
        scope           TEXT NOT NULL,
        model           TEXT NOT NULL,
        last_message_at TEXT NOT NULL,
        created_at      TEXT NOT NULL,
        updated_at      TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_conv_project
        ON conversations (project_id, updated_at DESC);

      CREATE TABLE IF NOT EXISTS messages (
        id              TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role            TEXT NOT NULL,
        content         TEXT NOT NULL,
        model           TEXT,
        latency_ms      INTEGER,
        created_at      TEXT NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id)
      );

      CREATE INDEX IF NOT EXISTS idx_msg_conv
        ON messages (conversation_id, created_at ASC);
    `)

    // Migration: heal conversations that stored the old, non-existent
    // 'llama3.2:3b-instruct' tag (which returns 404 from Ollama).
    try {
      aiDb.prepare(`UPDATE conversations SET model = ? WHERE model = ?`)
          .run('llama3.2:3b', 'llama3.2:3b-instruct')
      aiDb.prepare(`UPDATE messages SET model = ? WHERE model = ?`)
          .run('llama3.2:3b', 'llama3.2:3b-instruct')
    } catch {}
  }
  return aiDb
}

// ── Repository helpers ────────────────────────────────────────────────────
function mapConversation(row) {
  return {
    id:            row.id,
    projectId:     row.project_id  || undefined,
    title:         row.title,
    scope:         row.scope,
    model:         row.model,
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
    lastMessageAt: row.last_message_at,
    messageCount:  row.message_count || 0,
  }
}

function mapMessage(row) {
  return {
    id:             row.id,
    conversationId: row.conversation_id,
    role:           row.role,
    content:        row.content,
    model:          row.model || undefined,
    latencyMs:      row.latency_ms || undefined,
    createdAt:      row.created_at,
  }
}

function dbGetConversation(id) {
  const row = getAiDb().prepare(`
    SELECT c.*, COUNT(m.id) AS message_count
    FROM conversations c
    LEFT JOIN messages m ON m.conversation_id = c.id
    WHERE c.id = ? GROUP BY c.id
  `).get(id)
  return row ? mapConversation(row) : null
}

function dbGetLatestWorkspaceConversation() {
  const row = getAiDb().prepare(`
    SELECT c.*, COUNT(m.id) AS message_count
    FROM conversations c
    LEFT JOIN messages m ON m.conversation_id = c.id
    WHERE c.project_id IS NULL AND c.scope = 'workspace'
    GROUP BY c.id ORDER BY c.updated_at DESC LIMIT 1
  `).get()
  return row ? mapConversation(row) : null
}

function dbListConversationsByProject(projectId) {
  return getAiDb().prepare(`
    SELECT c.*, COUNT(m.id) AS message_count
    FROM conversations c
    LEFT JOIN messages m ON m.conversation_id = c.id
    WHERE c.project_id = ?
    GROUP BY c.id ORDER BY c.updated_at DESC
  `).all(projectId).map(mapConversation)
}

function dbListMessages(conversationId) {
  return getAiDb().prepare(`
    SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC
  `).all(conversationId).map(mapMessage)
}

function dbInsertMessage({ id, conversationId, role, content, model, latencyMs }) {
  const db  = getAiDb()
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO messages (id, conversation_id, role, content, model, latency_ms, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, conversationId, role, content, model || null, latencyMs || null, now)
  db.prepare(`UPDATE conversations SET updated_at = ?, last_message_at = ? WHERE id = ?`)
    .run(now, now, conversationId)
  return mapMessage(db.prepare(`SELECT * FROM messages WHERE id = ?`).get(id))
}

function dbCreateConversation({ id, projectId, title, scope, model }) {
  const db  = getAiDb()
  const now = new Date().toISOString()
  if (projectId) {
    db.prepare(`INSERT OR IGNORE INTO ai_projects (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`)
      .run(projectId, projectId, now, now)
  }
  db.prepare(`
    INSERT INTO conversations (id, project_id, title, scope, model, last_message_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, projectId || null, title, scope, model, now, now, now)
  return dbGetConversation(id)
}

function dbDeleteConversation(id) {
  const db       = getAiDb()
  const existing = dbGetConversation(id)
  if (!existing) return null
  db.transaction(() => {
    db.prepare(`DELETE FROM messages WHERE conversation_id = ?`).run(id)
    db.prepare(`DELETE FROM conversations WHERE id = ?`).run(id)
  })()
  return existing
}

function buildProviderMessages(history) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ]
}

// Build Ollama generation options from renderer-supplied opts.
// Only num_ctx is honored today; invalid/absent values fall back to the default.
function buildChatOptions(opts) {
  const n = Number(opts && opts.num_ctx)
  const num_ctx = Number.isFinite(n) && n >= 512 && n <= 131072 ? Math.floor(n) : DEFAULT_NUM_CTX
  return { num_ctx }
}

// ── Catalog metadata + embedding (best-effort; used by the background sync) ──
// All of these return null on any failure (Ollama down, model missing, bad JSON)
// so they can never block or break the catalog sync — the caller falls back to
// the existing empty defaults.

// Quick liveness gate so a stopped Ollama fails fast instead of timing out.
async function ollamaAlive() {
  try { const r = await httpGet('/api/tags', 3000); return !!r.ok } catch { return false }
}

const META_SYSTEM =
  'You extract bibliographic metadata from a research project and reply with ONLY a JSON object. ' +
  'Keys: authors (string[]), publishers (string[]), year (integer or null), tags (string[] up to 6), ' +
  'summary (string, 1-3 sentences). Use [] / null when unknown. Never invent authors, publishers, or years — ' +
  'only include them if clearly present in the text.'

// Coerce the model's JSON into a strict, safe shape.
function sanitizeMetadata(obj) {
  if (!obj || typeof obj !== 'object') return null
  const strArr = (v, max) => Array.isArray(v)
    ? v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim().slice(0, 200)).slice(0, max)
    : []
  let year = null
  const y = parseInt(obj.year, 10)
  if (Number.isFinite(y) && y >= 1000 && y <= 2100) year = y
  return {
    authors:    strArr(obj.authors, 20),
    publishers: strArr(obj.publishers, 20),
    year,
    tags:       strArr(obj.tags, 6),
    summary:    typeof obj.summary === 'string' ? obj.summary.trim().slice(0, 1200) : '',
  }
}

// Extract {authors, publishers, year, tags, summary} from project text. null on failure.
async function extractCatalogMetadata(title, bodyText) {
  if (!(await ollamaAlive())) return null
  const content = `Title: ${title || 'Untitled'}\n\n${(bodyText || '').slice(0, 24000)}`
  try {
    const res = await httpPost('/api/chat', {
      model:    DEFAULT_MODEL,
      messages: [{ role: 'system', content: META_SYSTEM }, { role: 'user', content }],
      stream:   false,
      format:   'json',
      options:  { num_ctx: 8192 },
    }, META_TIMEOUT_MS)
    if (!res.ok) return null
    const raw = res.body?.message?.content
    if (!raw) return null
    return sanitizeMetadata(JSON.parse(raw))
  } catch { return null }
}

// Generate a local embedding vector for the given text. null on failure.
async function generateEmbedding(text) {
  if (!text || !(await ollamaAlive())) return null
  try {
    const res = await httpPost('/api/embeddings', {
      model:  EMBED_MODEL,
      prompt: String(text).slice(0, 8000),
    }, META_TIMEOUT_MS)
    if (!res.ok || !Array.isArray(res.body?.embedding) || res.body.embedding.length === 0) return null
    return res.body.embedding
  } catch { return null }
}

// ── IPC registration ──────────────────────────────────────────────────────
function register(ipcMain) {

  // Health check — pings Ollama /api/tags
  ipcMain.handle('ai:health', async () => {
    try {
      const res = await httpGet('/api/tags', HEALTH_TIMEOUT_MS)
      if (!res.ok) {
        return {
          ok: false,
          message: `Ollama responded with ${res.status}. Try restarting Ollama.`,
          installedModels: [],
          preferredModel: DEFAULT_MODEL,
        }
      }
      const models = (res.body?.models || []).map((m) => ({
        name: m.name,
        size: typeof m.size === 'number' ? `${Math.round(m.size / 1024 / 1024)} MB` : undefined,
      }))
      const hasDefault = models.some((m) => m.name === DEFAULT_MODEL)
      return {
        ok: true,
        installedModels: models,
        preferredModel: hasDefault ? DEFAULT_MODEL : (models[0]?.name || DEFAULT_MODEL),
        message: models.length > 0
          ? `Ollama is running. Model: ${hasDefault ? DEFAULT_MODEL : models[0]?.name}`
          : `Ollama is running but no models found. Run: ollama pull ${DEFAULT_MODEL}`,
      }
    } catch (err) {
      return {
        ok: false,
        installedModels: [],
        preferredModel: DEFAULT_MODEL,
        message: 'Cannot reach Ollama. Make sure Ollama is installed and running (ollama serve).',
      }
    }
  })

  // Extract readable text from an attached file (PDF / DOCX / plain text) so the
  // model can actually read its contents. Returns { ok, name, text, chars, truncated }.
  ipcMain.handle('ai:extractFile', async (_, filePath) => {
    try {
      if (!filePath || typeof filePath !== 'string') return { ok: false, error: 'No file path provided.' }
      const ext = path.extname(filePath).toLowerCase()
      let text = ''

      if (ext === '.pdf') {
        // Import the parser module directly — pdf-parse's index.js runs debug code
        // that reads a bundled test PDF and throws inside a packaged asar.
        const pdfParse = require('pdf-parse/lib/pdf-parse.js')
        const data = await pdfParse(fs.readFileSync(filePath))
        text = data.text || ''
      } else if (ext === '.docx' || ext === '.doc') {
        const mammoth = require('mammoth')
        const result = await mammoth.extractRawText({ path: filePath })
        text = result.value || ''
      } else {
        text = fs.readFileSync(filePath, 'utf8')
      }

      const truncated = text.length > MAX_EXTRACT_CHARS
      return {
        ok: true,
        name: path.basename(filePath),
        text: truncated ? text.slice(0, MAX_EXTRACT_CHARS) : text,
        chars: text.length,
        truncated,
      }
    } catch (err) {
      return { ok: false, error: err?.message || 'Could not read this file.' }
    }
  })

  // Get or create a conversation
  ipcMain.handle('ai:getOrCreateConversation', (_, params = {}) => {
    try {
      const { projectId, scope = 'workspace', title } = params
      if (!projectId && scope === 'workspace') {
        const existing = dbGetLatestWorkspaceConversation()
        if (existing) return { conversation: existing }
      }
      if (projectId) {
        const list = dbListConversationsByProject(projectId)
        if (list.length > 0) return { conversation: list[0] }
      }
      const conversation = dbCreateConversation({
        id:        randomUUID(),
        projectId: projectId || undefined,
        title:     title || (projectId ? 'Project Chat' : 'AI Chat'),
        scope,
        model:     DEFAULT_MODEL,
      })
      return { conversation }
    } catch (err) {
      return { error: err.message }
    }
  })

  // Get a conversation with all its messages
  ipcMain.handle('ai:getConversation', (_, id) => {
    try {
      const conversation = dbGetConversation(id)
      if (!conversation) return { error: 'Conversation not found' }
      return { conversation, messages: dbListMessages(id) }
    } catch (err) {
      return { error: err.message }
    }
  })

  // List conversations for a project
  ipcMain.handle('ai:listConversations', (_, projectId) => {
    try {
      return { conversations: dbListConversationsByProject(projectId) }
    } catch (err) {
      return { error: err.message }
    }
  })

  // Delete a conversation and its messages
  ipcMain.handle('ai:deleteConversation', (_, id) => {
    try {
      const deleted = dbDeleteConversation(id)
      return deleted ? { ok: true } : { error: 'Conversation not found' }
    } catch (err) {
      return { error: err.message }
    }
  })

  // Blocking send — full response returned once complete
  ipcMain.handle('ai:sendMessage', async (_, conversationId, message, opts) => {
    try {
      const conversation = dbGetConversation(conversationId)
      if (!conversation) return { error: 'Conversation not found' }

      const userMsg      = dbInsertMessage({ id: randomUUID(), conversationId, role: 'user', content: message, model: conversation.model })
      const history      = dbListMessages(conversationId).slice(-HISTORY_LIMIT)
      const providerMsgs = buildProviderMessages(history)
      const startedAt    = Date.now()

      const res = await httpPost('/api/chat', {
        model: conversation.model, messages: providerMsgs, stream: false,
        options: buildChatOptions(opts),
      })
      if (!res.ok) return { error: `Ollama error ${res.status}` }

      const assistantMsg = dbInsertMessage({
        id:        randomUUID(),
        conversationId,
        role:      'assistant',
        content:   res.body.message?.content || '',
        model:     conversation.model,
        latencyMs: Date.now() - startedAt,
      })
      return { userMessage: userMsg, assistantMessage: assistantMsg }
    } catch (err) {
      return { error: err.message || 'AI request failed' }
    }
  })

  // Streaming send — returns { requestId, userMessage } immediately, then
  // pushes ai:stream:start / ai:stream:chunk / ai:stream:done / ai:stream:error events.
  ipcMain.handle('ai:streamMessage', (event, conversationId, message, opts) => {
    const requestId = randomUUID()
    try {
      const conversation = dbGetConversation(conversationId)
      if (!conversation) return { requestId, error: 'Conversation not found' }

      // Persist user message first so it's available in history
      const userMsg      = dbInsertMessage({ id: randomUUID(), conversationId, role: 'user', content: message, model: conversation.model })
      const history      = dbListMessages(conversationId).slice(-HISTORY_LIMIT)
      const providerMsgs = buildProviderMessages(history)

      const assistantMsgId = randomUUID()
      const startedAt      = Date.now()
      let   fullContent    = ''
      let   doneFired      = false

      // Notify renderer that the stream is starting
      if (!event.sender.isDestroyed()) {
        event.sender.send('ai:stream:start', { requestId, conversationId, messageId: assistantMsgId })
      }

      httpPostStream(
        '/api/chat',
        { model: conversation.model, messages: providerMsgs, stream: true, options: buildChatOptions(opts) },

        // onLine — called for every parsed NDJSON object from Ollama
        (parsed) => {
          const delta = parsed.message?.content ?? ''

          // Send token chunk to renderer
          if (delta && !event.sender.isDestroyed()) {
            fullContent += delta
            event.sender.send('ai:stream:chunk', {
              requestId, conversationId, messageId: assistantMsgId, delta,
            })
          }

          // Ollama marks the last message with done: true
          if (parsed.done && !doneFired) {
            doneFired = true
            try {
              const assistantMsg = dbInsertMessage({
                id:        assistantMsgId,
                conversationId,
                role:      'assistant',
                content:   fullContent,
                model:     conversation.model,
                latencyMs: Date.now() - startedAt,
              })
              if (!event.sender.isDestroyed()) {
                event.sender.send('ai:stream:done', {
                  requestId, conversationId, messageId: assistantMsgId, message: assistantMsg,
                })
              }
            } catch (dbErr) {
              if (!event.sender.isDestroyed()) {
                event.sender.send('ai:stream:error', { requestId, error: dbErr.message })
              }
            }
          }
        },

        // onEnd — stream closed; fire done if Ollama didn't send a done: true marker
        () => {
          if (!doneFired && !event.sender.isDestroyed()) {
            doneFired = true
            try {
              const assistantMsg = dbInsertMessage({
                id: assistantMsgId, conversationId, role: 'assistant',
                content: fullContent, model: conversation.model, latencyMs: Date.now() - startedAt,
              })
              event.sender.send('ai:stream:done', {
                requestId, conversationId, messageId: assistantMsgId, message: assistantMsg,
              })
            } catch (dbErr) {
              event.sender.send('ai:stream:error', { requestId, error: dbErr.message })
            }
          }
        },

        // onError
        (err) => {
          if (!event.sender.isDestroyed()) {
            event.sender.send('ai:stream:error', { requestId, error: err.message || 'Streaming failed' })
          }
        }
      )

      return { requestId, userMessage: userMsg }
    } catch (err) {
      return { requestId, error: err.message }
    }
  })
}

module.exports = { register, extractCatalogMetadata, generateEmbedding, EMBED_MODEL }
