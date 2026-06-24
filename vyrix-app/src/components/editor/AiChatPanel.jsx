import { useEffect, useRef, useState } from 'react'
import aiIcon from '../../assets/editor/ai.png'

// Demo conversation so the panel matches the Figma design out of the box.
const INITIAL_MESSAGES = [
  { role: 'user', text: 'Help me write this document' },
  { role: 'assistant', text: 'Lets get started as i can see ...' },
]

// Right-side AI chat panel (Figma 288:1755 / 288:2234). UI only — the real model
// is wired in later (see sendMessage's TODO).
// Props: { onClose, glass } — glass = translucent glassmorphic panel (project page)
export default function AiChatPanel({ onClose, glass = false }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    const text = input.trim()
    if (!text) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')

    // TODO(ai): replace this placeholder with a real call to the AI backend
    // (POST the message + document context, stream the reply into a message).
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: 'AI is not connected yet — responses will appear here once the model is wired in.',
        },
      ])
    }, 500)
  }

  return (
    <div
      className={`flex h-full flex-col ${
        glass
          ? 'w-full rounded-bl-[20px] rounded-tl-[20px] border border-[rgba(125,125,125,0.8)] bg-[rgba(119,119,121,0.26)] shadow-[1px_4px_7.7px_5px_rgba(0,0,0,0.25)] backdrop-blur-2xl'
          : 'w-[420px] shrink-0 border-l border-[rgba(255,255,255,0.08)] bg-[#0b0c13]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <img src={aiIcon} alt="" className="h-[18px] w-[18px]" />
          <span className="font-sf text-[14px] font-[590] text-[#d5d5d5]">AI Assistant</span>
        </div>
        <button
          onClick={onClose}
          title="Close"
          className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[8px] text-[18px] leading-none text-[#8d8d97] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-white"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="dark-scroll flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-3">
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div
              key={i}
              className="max-w-[80%] self-end rounded-[12px] bg-[#b2c5f2] px-4 py-[10px] font-sf text-[13px] font-[510] leading-snug text-black"
            >
              {m.text}
            </div>
          ) : (
            <div
              key={i}
              className="max-w-[88%] self-start rounded-[11px] bg-[#dcdcdc] px-4 py-3 font-sf text-[13px] font-[510] leading-snug text-black"
            >
              {m.text}
            </div>
          )
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-5 pt-2">
        <div className="flex items-center gap-3 rounded-[20px] border border-[rgba(255,255,255,0.28)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
          <button
            title="Attach"
            className="flex shrink-0 cursor-pointer items-center justify-center text-[#8d8d97] transition-colors hover:text-[#d5d5d5]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <div className="h-[24px] w-px shrink-0 bg-[rgba(255,255,255,0.18)]" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Ask anything"
            className="min-w-0 flex-1 bg-transparent font-sf text-[14px] text-white outline-none placeholder:text-[#8d8d97]"
          />
          <button
            onClick={sendMessage}
            title="Send"
            className="flex h-[36px] w-[36px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.12)] text-white transition-colors hover:bg-[rgba(255,255,255,0.2)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="6 11 12 5 18 11" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
