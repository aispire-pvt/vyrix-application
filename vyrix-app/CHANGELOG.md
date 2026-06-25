# Vyrix App — Change Log

All changes documented below were made across two development sessions. Every item listed is confirmed working.

---

## Session 1 — Bug Fixes

### Bug 1 · Document title stuck at "Untitled"

**Problem:** Renaming a document inside a project had no effect. The card in the Project page always showed "Untitled" even after the user typed a new name in the Editor.

**Root cause:** The Editor's `saveTitle` function calls `attachmentsApi.rename(projectId, attId, newName)` — but it only fires when **both** `projectId` and `attId` are present in the URL. When navigating from Project → Editor, the URL only included `?projectId=…` and was missing `attId`, so `saveTitle` silently skipped the rename.

**Fix — `src/pages/Project.jsx`:**
Changed every document card navigation from:
```js
navigate(`/doc/${att.docId}?projectId=${id}`)
```
to:
```js
navigate(`/doc/${att.docId}?projectId=${id}&attId=${att.id}`)
```
Now `attId` is always in the URL, so `Editor.jsx`'s `saveTitle` correctly renames the attachment.

---

### Bug 2 · Creating a document inside a project spawned a "new project" on the Home page

**Problem:** Every time a document was created inside a project, the parent project jumped to the top of the "Recent Activity" list on the Home page — and because both the parent and the new document defaulted to "Untitled", it appeared as if a brand-new project had been created.

**Root cause:** `writeAttachments()` in `electron/ipc/attachments.ipc.js` was updating the `updated_at` column on every attachment write (add, rename, remove). This bumped the parent project's timestamp, causing it to sort to the top of the recent list.

**Fix — `electron/ipc/attachments.ipc.js`:**
Removed `updated_at` from the `writeAttachments` SQL update:
```js
// Before
`UPDATE projects SET attachments = ?, updated_at = ? WHERE id = ?`

// After
`UPDATE projects SET attachments = ? WHERE id = ?`
```
Attachment operations no longer affect the project's recency sort position.

---

### Bug 3 · Links added to projects did nothing when clicked

**Problem:** Links added via "Add Link" in the Project page appeared as plain text cards. Clicking them had no effect.

**Root cause:** The attachment card's `onClick` handler only handled `type === 'document'` and called `navigate()`. Links (type `'link'`), Canva embeds, and Figma embeds had no handler.

**Fix — `src/pages/Project.jsx`:**
Replaced the single-purpose `onClick` with a multi-type handler:
```js
onClick={() => {
  if (att.type === 'document' && att.docId) {
    navigate(`/doc/${att.docId}?projectId=${id}&attId=${att.id}`)
  } else if (att.type === 'link' && att.url) {
    window.open(att.url, '_blank')
  } else if ((att.type === 'canva' || att.type === 'figma') && att.url) {
    window.open(att.url, '_blank')
  }
}}
```
`window.open(..., '_blank')` in Electron triggers `setWindowOpenHandler` → `shell.openExternal(url)`, opening the link in the system browser.

---

## Session 2 — AI Integration

The `vyrix-ai` module (a separate Next.js/TypeScript service) was ported into the Electron main process as plain CommonJS and integrated with the existing AI page (`/ai` route). The vyrix-ai frontend (chatbot-demo, page.tsx, layout.tsx) was intentionally **not** reused — only the backend logic was ported.

---

### New file · `electron/ipc/ai.ipc.js`

Self-contained AI backend for the Electron main process. Contains:

**Ollama client (via Node.js `http` module — not `fetch`)**
- `httpGet` — health check against `GET /api/tags`
- `httpPost` — blocking chat via `POST /api/chat` with `stream: false`
- `httpPostStream` — streaming chat via `POST /api/chat` with `stream: true`, using NDJSON line parsing

Using Node.js's built-in `http` module was a deliberate choice over the global `fetch` API. Electron 29 wraps `fetch` in a way that makes `ReadableStream` unreliable in the main process; `http.request` is stable across all Electron versions.

**SQLite conversation repository (`vyrix-ai.db`)**

Stored in Electron's `userData` directory (`AppData/Roaming/Vyrix/vyrix-ai.db`). Schema:

| Table | Purpose |
|---|---|
| `ai_projects` | Project scope records |
| `conversations` | One conversation per scope (workspace or project) |
| `messages` | All user and assistant messages, ordered by `created_at` |

**IPC handlers registered:**

| Channel | Description |
|---|---|
| `ai:health` | Pings Ollama `/api/tags`, returns model list and status message |
| `ai:getOrCreateConversation` | Returns the latest conversation for a scope, or creates one |
| `ai:getConversation` | Returns a conversation with all its messages |
| `ai:listConversations` | Lists all conversations for a project |
| `ai:deleteConversation` | Deletes a conversation and all its messages |
| `ai:sendMessage` | Blocking send — returns full assistant response |
| `ai:streamMessage` | Non-blocking — returns `{ requestId, userMessage }` immediately, then pushes streaming events |

**Streaming events pushed to renderer:**

| Event | Payload |
|---|---|
| `ai:stream:start` | `{ requestId, conversationId, messageId }` |
| `ai:stream:chunk` | `{ requestId, conversationId, messageId, delta }` |
| `ai:stream:done` | `{ requestId, conversationId, messageId, message }` |
| `ai:stream:error` | `{ requestId, error }` |

**System prompt:** Research-only assistant persona — scoped to PhD/academic work (literature review, methodology, academic writing, etc.). Refuses off-topic requests with a fixed message.

**Model:** `llama3.2:3b-instruct` via local Ollama at `http://127.0.0.1:11434`

---

### Modified · `electron/main.js`

Added two lines to register the AI IPC module:
```js
const aiIpc = require("./ipc/ai.ipc");
// ...
aiIpc.register(ipcMain);
```

---

### Modified · `electron/preload.js`

Exposed `window.vyrix.ai` namespace to the renderer:
```js
ai: {
  health, getOrCreateConversation, getConversation,
  listConversations, deleteConversation, sendMessage, streamMessage
}
```

Added AI streaming channels to the IPC event allowlist:
```js
"ai:stream:start", "ai:stream:chunk", "ai:stream:done", "ai:stream:error"
```

---

### Modified · `src/api/local.js`

Added export for the AI namespace:
```js
export const ai = w.ai
```

---

### Modified · `src/pages/AI.jsx`

Complete rewrite of the page's data layer. UI/layout was preserved exactly.

**Auth fix:** Replaced broken `api.get('/api/auth/me')` (leftover axios call) with `window.vyrix.getMe()`.

**Chat history:** On mount, loads the existing workspace conversation from SQLite and restores all previous messages. The greeting and suggestion prompts only show when there is genuinely no history.

**Real streaming AI:** `handleSubmit` now:
1. Calls `getOrCreateConversation` to get/create a persistent conversation
2. Calls `streamMessage` which returns a `requestId` immediately
3. Listens for `ai:stream:chunk` events to update the message bubble token-by-token
4. Listens for `ai:stream:done` to finalize the message
5. Listens for `ai:stream:error` to show an inline error bubble

**Ollama status banner:** On mount, `ai:health` is called. If Ollama is unreachable, a red banner appears at the top of the page with an actionable message (e.g. `Run: ollama serve`).

**Attachment feature:** The paperclip button now opens a file picker:
- Accepts text, code, CSV, JSON, Markdown, and common source file types
- File contents (up to 8,000 characters) are prepended to the prompt as context
- A dismissible pill above the input bar shows the attached filename
- Sending is allowed with a file and no text, or both combined
- Non-text files (images, PDFs, etc.) attach by filename label only

**Streaming guard:** Send button and Enter key are disabled while a response is streaming, preventing overlapping requests.

---

### Modified · `src/components/editor/AiChatPanel.jsx`

The right-side AI panel (used in Editor and Project pages) was updated from a static mock to real streaming AI.

- Removed hardcoded demo messages and 500ms `setTimeout` mock
- Wired the same streaming pattern as `AI.jsx` (`streamMessage` + event listeners)
- Shows bouncing-dot indicator while the model is generating
- Accepts optional `projectId` prop to scope the conversation to the current project
- Accepts optional `docContext` prop — prepended to the first message for document-aware context
- Send button disabled while streaming

---

## File Summary

| File | Status | Change type |
|---|---|---|
| `electron/ipc/ai.ipc.js` | New | AI backend — Ollama client, SQLite repo, 7 IPC handlers |
| `electron/main.js` | Modified | Register `ai.ipc.js` |
| `electron/preload.js` | Modified | Expose `window.vyrix.ai`, whitelist streaming channels |
| `electron/ipc/attachments.ipc.js` | Modified | Remove `updated_at` bump from `writeAttachments` |
| `src/pages/AI.jsx` | Modified | Real AI, streaming, history restore, attachments, Ollama banner |
| `src/components/editor/AiChatPanel.jsx` | Modified | Real streaming AI, remove mock |
| `src/pages/Project.jsx` | Modified | Fix link clicks, add `attId` to document navigation |
| `src/api/local.js` | Modified | Export `ai` namespace |
