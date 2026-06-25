import { useEffect, useState } from 'react'

// Setup wizard for local AI (Ollama + default model).
// Flow:
//   1. Check status → 'no-ollama' | 'no-model' | 'ready'
//   2. If no-ollama → download + run installer → start Ollama
//   3. If no-model → pull the model (streams progress)
//   4. On success → call onDone()

export default function AISetupModal({ onClose, onDone }) {
  const [stage, setStage] = useState('checking') // checking | no-ollama | no-model | ready | installing | error
  const [progress, setProgress] = useState({ percent: null, message: '' })
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)

  // Check current status on open
  useEffect(() => {
    window.vyrix.ai.setup.status()
      .then((r) => setStage(r.stage))
      .catch((err) => { setStage('error'); setError(err?.message || 'Could not check Ollama.') })
  }, [])

  // Listen to progress events
  useEffect(() => {
    const handler = (_, payload) => {
      setProgress({ percent: payload.percent, message: payload.message })
      if (payload.stage === 'ready') {
        setRunning(false)
        onDone?.()
      }
    }
    window.vyrix.on('ai:setup:progress', handler)
    return () => window.vyrix.off('ai:setup:progress', handler)
  }, [onDone])

  const handleInstall = async () => {
    setRunning(true)
    setError('')
    try {
      await window.vyrix.ai.setup.install()
      // After Ollama is up, fall through to model pull
      setStage('no-model')
      await window.vyrix.ai.setup.pullModel()
      setStage('ready')
    } catch (err) {
      setError(err?.message || 'Setup failed.')
      setStage('error')
    } finally {
      setRunning(false)
    }
  }

  const handlePullModel = async () => {
    setRunning(true)
    setError('')
    try {
      await window.vyrix.ai.setup.pullModel()
      setStage('ready')
    } catch (err) {
      setError(err?.message || 'Model download failed.')
      setStage('error')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-[520px] rounded-[16px] border border-[rgba(178,197,242,0.15)] bg-[#0e0f1c] p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-unbounded text-[22px] font-medium text-white">Set up Vyrix AI</h2>
          {!running && (
            <button onClick={onClose} className="rounded-md p-1 text-[#8d8d97] hover:text-white">✕</button>
          )}
        </div>

        <div className="mt-6">
          {stage === 'checking' && (
            <p className="font-sf text-[14px] text-[#a3a3a3]">Checking…</p>
          )}

          {stage === 'no-ollama' && !running && (
            <>
              <p className="font-sf text-[14px] leading-relaxed text-[#c7c7c7]">
                Vyrix uses a local AI model that runs on your machine — your notes never leave your device. To enable it, we'll install Ollama and download the default model (about 2 GB).
              </p>
              <p className="mt-3 font-sf text-[12px] text-[#8d8d97]">
                This is a one-time setup. Total time: 5–10 minutes depending on your connection.
              </p>
              <button
                onClick={handleInstall}
                className="mt-6 w-full rounded-[9px] bg-[#b2c5f2] py-3 font-sf text-[14px] font-bold text-black hover:bg-[#a0b5e8]"
              >
                Install AI
              </button>
            </>
          )}

          {stage === 'no-model' && !running && (
            <>
              <p className="font-sf text-[14px] leading-relaxed text-[#c7c7c7]">
                Ollama is installed, but the AI model isn't downloaded yet. This takes about 2 GB.
              </p>
              <button
                onClick={handlePullModel}
                className="mt-6 w-full rounded-[9px] bg-[#b2c5f2] py-3 font-sf text-[14px] font-bold text-black hover:bg-[#a0b5e8]"
              >
                Download Model
              </button>
            </>
          )}

          {running && (
            <>
              <p className="font-sf text-[14px] text-white">{progress.message || 'Working…'}</p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[rgba(178,197,242,0.15)]">
                <div
                  className="h-full bg-[#b2c5f2] transition-all duration-300"
                  style={{ width: typeof progress.percent === 'number' ? `${progress.percent}%` : '15%' }}
                />
              </div>
              <p className="mt-2 font-sf text-[12px] text-[#8d8d97]">Please keep this window open.</p>
            </>
          )}

          {stage === 'ready' && (
            <>
              <p className="font-sf text-[14px] text-white">AI is ready. You can now use Vyrix's research assistant.</p>
              <button
                onClick={onClose}
                className="mt-6 w-full rounded-[9px] bg-[#b2c5f2] py-3 font-sf text-[14px] font-bold text-black hover:bg-[#a0b5e8]"
              >
                Done
              </button>
            </>
          )}

          {stage === 'error' && (
            <>
              <p className="font-sf text-[14px] text-red-300">{error}</p>
              <p className="mt-3 font-sf text-[12px] text-[#8d8d97]">
                You can also install Ollama manually from <span className="text-[#b2c5f2]">ollama.com</span>.
              </p>
              <button
                onClick={onClose}
                className="mt-6 w-full rounded-[9px] border border-[rgba(178,197,242,0.3)] py-3 font-sf text-[14px] text-white hover:border-[#b2c5f2]"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
