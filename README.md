# Vyrix

AI-powered research assistant for PhD students and academic researchers. Available as a **web app** and a **native desktop app** (Electron) with local AI via Ollama.

---

## Repository structure

```
vyrix-app-integrated-version/
├── vyrix-backend-sample/   # Express.js REST API  ← AI intern's work ✅
├── vyrix-frontend-sample/  # React + Vite web app ← frontend team's work
├── vyrix-app/              # Electron desktop app  ← desktop team's work
├── docker-compose.yml      # Local dev (all services) ← AI intern's work ✅
└── .env.example            # Required env vars reference
```

---

## What the AI intern completed

### Backend (`vyrix-backend-sample/`) — fully production-ready

All API endpoints, auth, email, storage, and catalog sync are implemented and hardened.

**Auth** (`/api/auth`)
- Register / login with email + password (bcrypt, JWT 7-day tokens)
- Google OAuth — both web redirect flow (Electron) and access-token flow (web)
- httpOnly cookie + Bearer token dual-mode (supports both web and Electron)
- Token audience validation, fail-closed if `GOOGLE_CLIENT_ID` is missing

**Onboarding** (`/api/onboarding`)
- Send + verify 6-digit OTP via Brevo email API (bcrypt-hashed, 10-min expiry)
- Profile creation with ImageKit image upload (5 MB limit, JPEG/PNG/WebP only)

**Feedback** (`/api/feedback`)
- Bug reports and suggestions emailed to team via Brevo

**Catalog sync** (`/api/catalog`)
- Mirrors Electron project content to Supabase on every save (called by desktop app)

**Security hardening applied**
- Rate limiting on all auth + OTP endpoints (in-memory, single-instance)
- Startup validation — server exits immediately if `MONGO_URI` or `JWT_SECRET` missing
- `JWT_SECRET` minimum 32-character check at startup
- Input validation on all user-supplied fields (username, profession, theme, OTP)
- HTML escaping on all feedback email fields (XSS prevention)
- Google token audience is now required — won't silently skip validation
- MongoDB connection failure exits the process (no silent broken-server state)
- File upload size cap (5 MB) and MIME type whitelist

### AI module (`vyrix-app/electron/ipc/ai.ipc.js`) — fully integrated

Local AI via Ollama running on the user's machine. Zero cloud dependency for AI.

- Streaming chat (NDJSON line-by-line, pushes `ai:stream:chunk` events to renderer)
- Non-streaming blocking chat (`ai:sendMessage`)
- Conversation + message persistence in local SQLite (`vyrix-ai.db`)
- 20-message rolling history window sent to model
- Health check (`ai:health`) — reports installed models, guides user if Ollama not running
- System prompt scoped to academic research only (refuses off-topic requests)
- All Ollama HTTP via Node.js `http` module (not `fetch`) — reliable in all Electron versions
- Timeouts: 5s health check, 120s chat

### Docker (`docker-compose.yml`, `*/Dockerfile`) — ready to use

See **Running locally** below.

---

## What's left for the team

### Frontend team (`vyrix-frontend-sample/`)

The backend API is fully operational. The frontend just needs to call it correctly.

**Check these before launch:**

1. **`VITE_API_URL`** must be set to the deployed backend URL in Vercel environment variables. Without it, every API call goes to `localhost:3000` in production and fails silently.

2. **`VITE_GOOGLE_CLIENT_ID`** must be set in Vercel — same value as `GOOGLE_CLIENT_ID` on the backend.

3. **`.env.production` is now in `.gitignore`** — it was previously committed with the Google Client ID. The file has been removed from tracking. Set these values in the Vercel dashboard instead.

4. The 403 interceptor in `src/api/axios.js` redirects to `/login` on expired tokens — verify all protected pages handle the redirect gracefully.

5. Onboarding flow sequence: `register → send-otp → verify-otp → profile upload → /home`. Make sure the frontend respects the `emailVerified` and `onboardingCompleted` flags returned by `/api/auth/me`.

### Desktop team (`vyrix-app/`)

The Electron main process, all IPC handlers, SQLite schema, and Ollama AI are complete. The renderer (React UI inside Electron) needs to wire up to the `window.vyrix` API exposed by the preload script.

**Full `window.vyrix` API surface** (from `electron/preload.js`):

```
Auth:     register, login, loginGoogle, googleCallback, saveToken, logout, getMe, heartbeat, logUsage, sendFeedback
Projects: projects.list, listFull, get, create, save, delete, move
Folders:  folders.list, get, create, rename, delete
Todos:    todos.list, create, toggle, delete
Sync:     sync.drain
AI:       ai.health, ai.getOrCreateConversation, ai.getConversation, ai.listConversations,
          ai.deleteConversation, ai.sendMessage, ai.streamMessage
```

**IPC events the renderer must listen for:**
- `app:ready` — fired on launch with `{ version }` — use this to trigger heartbeat
- `auth:deepLink` — fired after Google OAuth deep-link returns with `{ token, error }`
- `ai:stream:start`, `ai:stream:chunk`, `ai:stream:done`, `ai:stream:error` — streaming AI events

**AI streaming example:**
```js
// Start a stream
const { requestId, userMessage } = await window.vyrix.ai.streamMessage(conversationId, text);

// Listen for chunks
window.electron.on('ai:stream:chunk', ({ requestId, delta }) => appendToUI(delta));
window.electron.on('ai:stream:done', ({ message }) => finalizeMessage(message));
window.electron.on('ai:stream:error', ({ error }) => showError(error));
```

**Ollama must be installed by the user.** The app won't break if it's not — `ai.health` returns `ok: false` with a helpful message. Show a setup guide in the UI when health check fails.

---

## Running locally

**Prerequisites:** Docker + Docker Compose

```bash
# 1. Clone and set up env
cp .env.example .env
# Edit .env — fill in JWT_SECRET (min 32 chars), GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# 2. Start everything
docker compose up --build

# Frontend → http://localhost:80
# Backend  → http://localhost:3000
# MongoDB  → internal only
```

To run services individually without Docker, see `DEPLOYMENT.md`.

---

## Deploying to production

See `DEPLOYMENT.md` for the full Render + Vercel guide. Short version:

| Service | Platform | Key env vars to set |
|---------|----------|---------------------|
| Backend | Render | `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BREVO_API_KEY`, `IMAGEKIT_PRIVATE_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `CLIENT_URL`, `NODE_ENV=production` |
| Frontend | Vercel | `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID` |

**Critical before first deploy:** `JWT_SECRET` must be a random string of at least 32 characters. The server will refuse to start without it.

---

## Environment variables reference

Copy `.env.example` → `.env` and fill in:

| Variable | Required | Notes |
|----------|----------|-------|
| `JWT_SECRET` | Yes | Min 32 chars. Generate: `openssl rand -hex 32` |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth — also needed in Vercel as `VITE_GOOGLE_CLIENT_ID` |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth — backend only |
| `BREVO_API_KEY` | Production | Email sending. Without it, OTPs only log to console |
| `BREVO_SENDER` | Production | Verified sender email in your Brevo account |
| `IMAGEKIT_PRIVATE_KEY` | Production | Profile picture uploads |
| `SUPABASE_URL` | Production | Catalog sync |
| `SUPABASE_SERVICE_KEY` | Production | Catalog sync — rotate this post-launch |
| `CLIENT_URL` | Production | Exact frontend URL for CORS (no trailing slash) |
| `FEEDBACK_EMAIL` | Optional | Where feedback emails go. Defaults to `BREVO_SENDER` |

---

## Tech stack

| Layer | Tech |
|-------|------|
| Backend API | Node.js, Express 5, Mongoose, JWT, bcrypt |
| Database (cloud) | MongoDB Atlas |
| Database (desktop) | SQLite via better-sqlite3 |
| Catalog sync | Supabase (PostgreSQL) |
| Email | Brevo REST API |
| Image storage | ImageKit |
| AI | Ollama (local, llama3.2:3b-instruct default) |
| Desktop shell | Electron 33, contextIsolation + sandbox enabled |
| Web frontend | React 18, Vite, TailwindCSS, TipTap editor |
| Auth (web) | Google OAuth via @react-oauth/google |
| Auth (desktop) | Google OAuth via browser redirect + `vyrix://` deep link |
