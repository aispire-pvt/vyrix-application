import { useEffect, useState } from 'react'

// Suggestion / bug-report modal. Same dark vibe as the move modal.
export default function FeedbackModal({ isOpen, onClose }) {
  const [type, setType] = useState('suggestion') // 'suggestion' | 'bug'
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // Reset whenever it opens.
  useEffect(() => {
    if (isOpen) {
      setType('suggestion')
      setMessage('')
      setSubmitting(false)
      setError('')
      setDone(false)
    }
  }, [isOpen])

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async () => {
    const text = message.trim()
    if (!text) {
      setError('Please write a little something first.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const result = await window.vyrix.sendFeedback(type, text)
      if (!result?.success) { setError(result?.message || 'Could not send. Please try again.'); setSubmitting(false); return }
      setDone(true)
      setTimeout(onClose, 1600)
    } catch {
      setError('Could not send. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-[440px] max-w-[92%] overflow-hidden rounded-[22px] border border-[rgba(140,140,140,0.5)] bg-[rgba(12,12,24,0.96)] shadow-[0px_40px_100px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="relative border-b border-[rgba(150,150,165,0.16)] px-[27px] pb-[18px] pt-[24px]">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-[33px] w-[33px] cursor-pointer items-center justify-center rounded-[10px] border border-[rgba(150,150,165,0.16)] bg-[rgba(255,255,255,0.05)] text-[16px] text-white transition-colors hover:bg-[rgba(255,255,255,0.1)]"
          >
            ×
          </button>
          <p className="font-sf text-[18.6px] font-bold text-white">
            Give Suggestion <span className="text-[#8d8d97]">/</span> Report a Bug
          </p>
          <p className="mt-[6px] text-[12.7px] text-[#8d8d97]">
            We read every message — it goes straight to the team.
          </p>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center gap-2 px-[27px] py-[44px] text-center">
            <div className="text-[30px]">✅</div>
            <p className="text-[15px] font-[590] text-white">Thanks for the feedback!</p>
            <p className="text-[12.7px] text-[#8d8d97]">Sent to the Vyrix team.</p>
          </div>
        ) : (
          <div className="px-[27px] py-[20px]">
            {/* Type toggle */}
            <div className="mb-4 flex gap-3">
              {[
                { key: 'suggestion', label: 'Suggestion' },
                { key: 'bug', label: 'Report a Bug' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setType(opt.key)}
                  className={`flex-1 cursor-pointer rounded-[11px] border px-4 py-[10px] text-[14px] font-[590] transition-colors ${
                    type === opt.key
                      ? 'border-transparent bg-[#b2c5f2] text-[#0e1022]'
                      : 'border-[rgba(140,140,140,0.5)] text-[#d5d5d5] hover:bg-[rgba(255,255,255,0.05)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Message */}
            <textarea
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={4000}
              rows={5}
              placeholder={
                type === 'bug'
                  ? 'What went wrong? Steps to reproduce help a lot.'
                  : 'What would make Vyrix better for you?'
              }
              className="w-full resize-none rounded-[13px] border border-[rgba(150,150,165,0.3)] bg-[rgba(255,255,255,0.03)] px-[14px] py-[12px] text-[14px] text-[#e7e7e7] outline-none placeholder:text-[#7e7e8c] focus:border-[#b2c5f2]"
            />

            {error && (
              <p className="mt-2 text-[12.7px] text-red-400">{error}</p>
            )}

            {/* Footer */}
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="cursor-pointer rounded-[13px] border border-[rgba(140,140,140,0.5)] px-[22px] py-[11px] text-[14px] font-bold text-[#d5d5d5] transition-colors hover:bg-[rgba(255,255,255,0.05)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`rounded-[13px] px-[22px] py-[11px] text-[14px] font-bold text-[#0e1022] transition-all ${
                  submitting
                    ? 'cursor-not-allowed bg-[#b2c5f2] opacity-50'
                    : 'cursor-pointer bg-[#b2c5f2] hover:bg-[#c5d4f5]'
                }`}
              >
                {submitting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
