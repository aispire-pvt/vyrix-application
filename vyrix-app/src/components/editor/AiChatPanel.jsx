import { useCallback, useEffect, useRef, useState } from 'react'
import aiIcon from '../../assets/editor/ai.png'
import ChatMarkdown from '../ai/ChatMarkdown'

// Right-side AI chat panel (Figma 288:1755 / 288:2234).
// Wired to Ollama via Electron IPC with streaming support.
// Props: { onClose, glass, projectId, docContext }
//   glass      — glassmorphic variant used on the Project page
//   projectId  — scope conversations to the current project (optional)
//   docContext — extra text prepended as context for the editor page (optional)
export default function AiChatPanel({ onClose, glass = false, projectId, docContext }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const conversationIdRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Ensure a conversation exists (project-scoped if projectId provided).
  const ensureConversation = useCallback(async () => {
    if (conversationIdRef.current) return conversationIdRef.current
    const params = projectId
      ? { projectId, scope: 'project', title: 'Project Chat' }
      : { scope: 'workspace', title: 'Document Chat' }
    const res = await window.vyrix.ai.getOrCreateConversation(params)
    if (res?.conversation?.id) {
      conversationIdRef.current = res.conversation.id
      return res.conversation.id
    }
    return null
  }, [projectId])

  const showPanelError = useCallback((text) => {
    setMessages((m) => {
      const lastStreaming = m.length > 0 && m[m.length - 1].streaming
      if (lastStreaming) return [...m.slice(0, -1), { role: 'assistant', text }]
      return [...m, { role: 'assistant', text }]
    })
    setIsStreaming(false)
  }, [])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    let convId
    try {
      convId = await ensureConversation()
    } catch {
      convId = null
    }

    if (!convId) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: 'Could not connect to AI. Make sure Ollama is running (ollama serve).' },
      ])
      return
    }

    // Build final message — optionally prepend doc context on first message.
    const fullText = docContext && messages.length === 0
      ? `Context:\n${docContext}\n\n${text}`
      : text

    setMessages((m) => [
      ...m,
      { role: 'user', text },
      { role: 'assistant', text: '', streaming: true },
    ])
    setInput('')
    setIsStreaming(true)

    let streamRes
    try {
      // In-editor chatbot uses the lightweight 4k window (no file attachments here).
      streamRes = await window.vyrix.ai.streamMessage(convId, fullText, { num_ctx: 4096 })
    } catch (err) {
      showPanelError(err?.message || 'Failed to contact AI backend.')
      return
    }

    if (streamRes?.error) {
      showPanelError(streamRes.error)
      return
    }

    const requestId = streamRes?.requestId
    let accumulated = ''

    const cleanup = () => {
      window.vyrix.off('ai:stream:chunk', onChunk)
      window.vyrix.off('ai:stream:done',  onDone)
      window.vyrix.off('ai:stream:error', onError)
    }

    function onChunk(_, payload) {
      if (payload.requestId !== requestId) return
      accumulated += payload.delta
      const snapshot = accumulated
      setMessages((m) =>
        m.map((msg, i) =>
          i === m.length - 1 && msg.streaming
            ? { role: 'assistant', text: snapshot, streaming: true }
            : msg
        )
      )
    }

    function onDone(_, payload) {
      if (payload.requestId !== requestId) return
      cleanup()
      setMessages((m) =>
        m.map((msg, i) =>
          i === m.length - 1 && msg.streaming
            ? { role: 'assistant', text: payload.message?.content || accumulated }
            : msg
        )
      )
      setIsStreaming(false)
    }

    function onError(_, payload) {
      if (payload.requestId !== requestId) return
      cleanup()
      showPanelError(payload.error || 'An error occurred while generating a response.')
    }

    window.vyrix.on('ai:stream:chunk', onChunk)
    window.vyrix.on('ai:stream:done',  onDone)
    window.vyrix.on('ai:stream:error', onError)
  }, [input, isStreaming, ensureConversation, docContext, messages.length, showPanelError])

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
        {messages.length === 0 && (
          <p className="mt-4 text-center font-sf text-[12px] text-[#8d8d97]">
            Ask anything about your research…
          </p>
        )}
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
              {m.streaming && !m.text ? (
                <span className="flex items-center gap-1">
                  <span className="h-[5px] w-[5px] animate-bounce rounded-full bg-[#555]" style={{ animationDelay: '0ms' }} />
                  <span className="h-[5px] w-[5px] animate-bounce rounded-full bg-[#555]" style={{ animationDelay: '150ms' }} />
                  <span className="h-[5px] w-[5px] animate-bounce rounded-full bg-[#555]" style={{ animationDelay: '300ms' }} />
                </span>
              ) : (
                <ChatMarkdown tone="light">{m.text}</ChatMarkdown>
              )}
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
            disabled={!input.trim() || isStreaming}
            title="Send"
            className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.12)] text-white transition-colors ${!input.trim() || isStreaming ? 'cursor-default opacity-40' : 'cursor-pointer hover:bg-[rgba(255,255,255,0.2)]'}`}
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
