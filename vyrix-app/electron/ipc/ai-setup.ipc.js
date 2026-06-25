// AI setup flow — checks Ollama status, downloads + installs Ollama binary,
// pulls the default chat model. Streams progress events to the renderer.
//
// IPC channels:
//   ai:setup:status   → { stage: 'ready' | 'no-ollama' | 'no-model' }
//   ai:setup:install  → downloads + runs Ollama installer (stream progress)
//   ai:setup:pullModel → pulls the default model (stream progress)
//
// Streaming events (event.sender.send):
//   ai:setup:progress { stage, percent, message }

const { app, shell } = require('electron')
const http  = require('http')
const https = require('https')
const fs    = require('fs')
const path  = require('path')
const { spawn, execFile } = require('child_process')

const OLLAMA_HOST = '127.0.0.1'
const OLLAMA_PORT = 11434
const DEFAULT_MODEL = process.env.DEFAULT_CHAT_MODEL || 'llama3.2:3b-instruct'

// Ollama installer download URLs (official Ollama releases)
const OLLAMA_INSTALLERS = {
    win32:  { url: 'https://ollama.com/download/OllamaSetup.exe', file: 'OllamaSetup.exe' },
    darwin: { url: 'https://ollama.com/download/Ollama-darwin.zip', file: 'Ollama-darwin.zip' },
    linux:  { url: 'https://ollama.com/install.sh', file: 'install.sh' },
}

// ── Helpers ───────────────────────────────────────────────────────────────

function checkOllamaRunning() {
    return new Promise((resolve) => {
        const req = http.get({ hostname: OLLAMA_HOST, port: OLLAMA_PORT, path: '/api/tags', timeout: 3000 }, (res) => {
            let data = ''
            res.on('data', (c) => { data += c })
            res.on('end', () => {
                try { resolve({ ok: true, body: JSON.parse(data) }) }
                catch { resolve({ ok: true, body: { models: [] } }) }
            })
        })
        req.on('error', () => resolve({ ok: false }))
        req.on('timeout', () => { req.destroy(); resolve({ ok: false }) })
    })
}

function hasModel(tagsBody, modelName) {
    if (!tagsBody?.models) return false
    return tagsBody.models.some((m) => m.name === modelName || m.name?.startsWith(modelName + ':'))
}

function downloadFile(url, destPath, onProgress) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath)
        const handler = (res) => {
            // Follow redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                https.get(res.headers.location, handler).on('error', reject)
                return
            }
            if (res.statusCode !== 200) {
                file.close()
                fs.unlink(destPath, () => {})
                reject(new Error(`Download failed: ${res.statusCode}`))
                return
            }
            const total = parseInt(res.headers['content-length'] || '0', 10)
            let received = 0
            res.on('data', (chunk) => {
                received += chunk.length
                if (total > 0) onProgress(Math.round((received / total) * 100))
            })
            res.pipe(file)
            file.on('finish', () => file.close(() => resolve()))
            file.on('error', reject)
        }
        https.get(url, handler).on('error', reject)
    })
}

function runOllamaInstaller(installerPath, platform) {
    return new Promise((resolve, reject) => {
        if (platform === 'win32') {
            // Silent install
            const proc = spawn(installerPath, ['/SILENT'], { stdio: 'ignore', detached: false })
            proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Installer exit ${code}`)))
            proc.on('error', reject)
        } else if (platform === 'darwin') {
            // Mac: open the zip so the user can drag the app — fallback approach
            shell.openPath(installerPath).then((err) => {
                if (err) reject(new Error(err))
                else resolve()
            })
        } else if (platform === 'linux') {
            const proc = spawn('sh', [installerPath], { stdio: 'inherit' })
            proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Installer exit ${code}`)))
            proc.on('error', reject)
        } else {
            reject(new Error('Unsupported platform: ' + platform))
        }
    })
}

function startOllama() {
    try {
        const proc = spawn('ollama', ['serve'], { detached: true, stdio: 'ignore', windowsHide: true })
        proc.unref()
        proc.on('error', () => {})
    } catch {}
}

function waitForOllama(timeoutMs = 60000) {
    return new Promise((resolve, reject) => {
        const start = Date.now()
        const tick = async () => {
            const r = await checkOllamaRunning()
            if (r.ok) return resolve()
            if (Date.now() - start > timeoutMs) return reject(new Error('Ollama did not start in time'))
            setTimeout(tick, 1500)
        }
        tick()
    })
}

function pullModel(modelName, onProgress) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ name: modelName, stream: true })
        const req = http.request({
            hostname: OLLAMA_HOST,
            port: OLLAMA_PORT,
            path: '/api/pull',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        }, (res) => {
            let buffer = ''
            res.on('data', (chunk) => {
                buffer += chunk.toString()
                let nl
                while ((nl = buffer.indexOf('\n')) >= 0) {
                    const line = buffer.slice(0, nl).trim()
                    buffer = buffer.slice(nl + 1)
                    if (!line) continue
                    try {
                        const evt = JSON.parse(line)
                        if (evt.total && evt.completed) {
                            const pct = Math.round((evt.completed / evt.total) * 100)
                            onProgress(pct, evt.status || 'downloading')
                        } else if (evt.status) {
                            onProgress(null, evt.status)
                        }
                    } catch {}
                }
            })
            res.on('end', () => resolve())
            res.on('error', reject)
        })
        req.on('error', reject)
        req.write(body)
        req.end()
    })
}

// ── IPC registration ──────────────────────────────────────────────────────

function register(ipcMain) {
    ipcMain.handle('ai:setup:status', async () => {
        const r = await checkOllamaRunning()
        if (!r.ok) return { stage: 'no-ollama' }
        if (!hasModel(r.body, DEFAULT_MODEL)) return { stage: 'no-model' }
        return { stage: 'ready' }
    })

    ipcMain.handle('ai:setup:install', async (event) => {
        const platform = process.platform
        const cfg = OLLAMA_INSTALLERS[platform]
        if (!cfg) throw new Error('Unsupported platform: ' + platform)

        const tmpPath = path.join(app.getPath('temp'), cfg.file)

        event.sender.send('ai:setup:progress', { stage: 'downloading', percent: 0, message: 'Downloading Ollama installer…' })
        await downloadFile(cfg.url, tmpPath, (pct) => {
            event.sender.send('ai:setup:progress', { stage: 'downloading', percent: pct, message: `Downloading Ollama installer… ${pct}%` })
        })

        event.sender.send('ai:setup:progress', { stage: 'installing', percent: null, message: 'Installing Ollama… (this may take a minute)' })
        await runOllamaInstaller(tmpPath, platform)

        event.sender.send('ai:setup:progress', { stage: 'starting', percent: null, message: 'Starting Ollama…' })
        startOllama()
        await waitForOllama(60000)

        event.sender.send('ai:setup:progress', { stage: 'installed', percent: 100, message: 'Ollama is ready.' })
        return { ok: true }
    })

    ipcMain.handle('ai:setup:pullModel', async (event) => {
        event.sender.send('ai:setup:progress', { stage: 'pulling', percent: 0, message: `Downloading model ${DEFAULT_MODEL}…` })
        await pullModel(DEFAULT_MODEL, (pct, status) => {
            event.sender.send('ai:setup:progress', { stage: 'pulling', percent: pct, message: status ? `${status} ${pct ?? ''}%`.trim() : 'Downloading model…' })
        })
        event.sender.send('ai:setup:progress', { stage: 'ready', percent: 100, message: 'AI is ready.' })
        return { ok: true }
    })
}

module.exports = { register }
