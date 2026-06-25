import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/home/Sidebar'
import Navbar from '../components/home/Navbar'
import TodoPanel from '../components/home/TodoPanel'
import AISetupModal from '../components/ai/AISetupModal'

// AI Page assets — GRADIENT 1 (the signature dark blue-purple gradient).
const imgVector15 = 'https://www.figma.com/api/mcp/asset/5e9d9fff-f342-4fc8-9935-fdf30f756d9d'
const imgVector16 = 'https://www.figma.com/api/mcp/asset/681b0a60-697b-4d3c-9217-a6226e8244ac'
const imgRectangle2 = 'https://www.figma.com/api/mcp/asset/6ae41cb1-6ce2-4298-8fb3-4ce6728e76da'
const imgVector17 = 'https://www.figma.com/api/mcp/asset/4fd2e9bf-07b3-4e7f-a344-aa28bcbee5c1'
const imgLine10 = 'https://www.figma.com/api/mcp/asset/0fcf833e-13da-4655-9367-2a725058e240' // horizontal divider line
const imgPaperclip1 = 'https://www.figma.com/api/mcp/asset/32ca8cdd-c98a-427d-8fe2-4a010d8b1ff6'
const imgEllipse7 = 'https://www.figma.com/api/mcp/asset/48ac5656-8188-4153-b6e4-5a9d0a9b6fe0'
const imgGroup136 = 'https://www.figma.com/api/mcp/asset/b3ff8f6f-a763-4c0c-ab15-3ccead31d3ef'
const imgLine33 = 'https://www.figma.com/api/mcp/asset/251086dd-45a9-46c5-ba5a-cf5e973d5d93'

const SUGGESTIONS = [
  'Lets find a new research paper today !',
  'Hello Ai! Lets start with a fresh topic',
  'Lets review our ongoing projects',
]

// AI research-assistant page — wired to Ollama via Electron IPC.
export default function AI() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isTodoOpen, setIsTodoOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [ollamaStatus, setOllamaStatus] = useState(null) // null | { ok, message }
  const [showSetup, setShowSetup] = useState(false)
  const [attachedFile, setAttachedFile] = useState(null) // { name, content }
  const conversationIdRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const handleSuggestionClick = (text) => {
    setInputText(text)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // Opens the file picker; reads text-based files and attaches them to the next message.
  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset so the same file can be re-selected
    e.target.value = ''

    const isText = file.type.startsWith('text/') ||
      /\.(txt|md|csv|json|js|ts|jsx|tsx|py|java|c|cpp|h|html|css|xml|yaml|yml|log)$/i.test(file.name)

    if (!isText) {
      // For non-text files just attach the name as context label
      setAttachedFile({ name: file.name, content: null })
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target.result?.slice(0, 8000) // cap at 8k chars
      setAttachedFile({ name: file.name, content })
    }
    reader.readAsText(file)
  }

  // Appends an AI error bubble and resets streaming state.
  const showError = useCallback((text) => {
    setMessages((prev) => {
      // Replace streaming placeholder if one exists, otherwise append.
      const lastIsStreaming = prev.length > 0 && prev[prev.length - 1].streaming
      if (lastIsStreaming) {
        return [...prev.slice(0, -1), { role: 'ai', text }]
      }
      return [...prev, { role: 'ai', text }]
    })
    setIsStreaming(false)
  }, [])

  // Load existing conversation + history on mount (once user is ready).
  const loadHistory = useCallback(async () => {
    try {
      const res = await window.vyrix.ai.getOrCreateConversation({ scope: 'workspace' })
      if (!res?.conversation?.id) return
      conversationIdRef.current = res.conversation.id

      // If there are existing messages, fetch and display them.
      if (res.conversation.messageCount > 0) {
        const detail = await window.vyrix.ai.getConversation(res.conversation.id)
        if (detail?.messages?.length > 0) {
          setMessages(
            detail.messages.map((m) => ({ role: m.role === 'assistant' ? 'ai' : m.role, text: m.content }))
          )
        }
      }
    } catch { /* silently ignore */ }
  }, [])

  // Ensure a workspace conversation exists before the first message.
  const ensureConversation = useCallback(async () => {
    if (conversationIdRef.current) return conversationIdRef.current
    try {
      const res = await window.vyrix.ai.getOrCreateConversation({ scope: 'workspace' })
      if (res?.conversation?.id) {
        conversationIdRef.current = res.conversation.id
        return res.conversation.id
      }
      return null
    } catch {
      return null
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    const text = inputText.trim()
    if ((!text && !attachedFile) || isStreaming) return
    setInputText('')

    let convId
    try {
      convId = await ensureConversation()
    } catch {
      convId = null
    }

    if (!convId) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Could not start a conversation. Make sure Ollama is running (ollama serve).' },
      ])
      return
    }

    // Build the message sent to the model — include file content if attached.
    const currentFile = attachedFile
    let modelMessage  = text
    let displayText   = text
    if (currentFile) {
      displayText   = `📎 ${currentFile.name}${text ? `  ${text}` : ''}`
      modelMessage  = currentFile.content
        ? `[Attached file: ${currentFile.name}]\n\`\`\`\n${currentFile.content}\n\`\`\`\n\n${text}`
        : `[Attached file: ${currentFile.name}]\n\n${text}`
      setAttachedFile(null)
    }

    // Append user message + streaming placeholder.
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: displayText },
      { role: 'ai', text: '', typing: true, streaming: true },
    ])
    setIsStreaming(true)

    let streamRes
    try {
      streamRes = await window.vyrix.ai.streamMessage(convId, modelMessage)
    } catch (err) {
      showError(err?.message || 'Failed to contact AI backend.')
      return
    }

    if (streamRes?.error) {
      showError(streamRes.error)
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
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 && m.streaming
            ? { role: 'ai', text: snapshot, typing: false, streaming: true }
            : m
        )
      )
    }

    function onDone(_, payload) {
      if (payload.requestId !== requestId) return
      cleanup()
      const finalText = payload.message?.content || accumulated
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 && m.streaming
            ? { role: 'ai', text: finalText }
            : m
        )
      )
      setIsStreaming(false)
    }

    function onError(_, payload) {
      if (payload.requestId !== requestId) return
      cleanup()
      showError(payload.error || 'An error occurred while generating a response.')
    }

    window.vyrix.on('ai:stream:chunk', onChunk)
    window.vyrix.on('ai:stream:done',  onDone)
    window.vyrix.on('ai:stream:error', onError)
  }, [inputText, attachedFile, isStreaming, ensureConversation, showError])

  // Auto-scroll to the newest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus the input once the page has loaded.
  useEffect(() => {
    if (!loading) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [loading])

  // Load user, then load chat history and check Ollama health
  useEffect(() => {
    let active = true
    window.vyrix.getMe()
      .then((res) => {
        if (!active) return
        setUser(res?.user || { firstName: '', profilePic: null })
        setLoading(false)
        // Load history and health check after user is confirmed
        loadHistory()
        window.vyrix.ai.health()
          .then((r) => { if (active) setOllamaStatus(r) })
          .catch(() => { if (active) setOllamaStatus({ ok: false, message: 'Cannot reach Ollama. Run: ollama serve' }) })
      })
      .catch(() => {
        if (!active) return
        navigate('/login')
      })
    return () => { active = false }
  }, [navigate, loadHistory])

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <p className="font-unbounded text-lg text-[#d5d5d5]">Loading...</p>
      </div>
    )
  }

  const firstName = user?.firstName || 'there'

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black">
      <Sidebar user={user} activePage="ai" />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleTodo={() => setIsTodoOpen((v) => !v)}
          isTodoOpen={isTodoOpen}
          activeTabTitle="AI"
          onCloseActiveTab={() => navigate('/home')}
        />

        {/* Ollama status banner — offers one-click setup */}
        {ollamaStatus && !ollamaStatus.ok && (
          <div className="z-50 flex items-center justify-between border-b border-[rgba(178,197,242,0.15)] bg-[rgba(178,197,242,0.06)] px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-[#b2c5f2]" />
              <span className="font-sf text-[12px] font-bold text-white">AI isn't set up yet — install in one click</span>
            </div>
            <button
              onClick={() => setShowSetup(true)}
              className="rounded-lg bg-[#b2c5f2] px-4 py-1.5 font-sf text-[12px] font-bold text-black hover:bg-[#a0b5e8]"
            >
              Set up AI
            </button>
          </div>
        )}

        {showSetup && (
          <AISetupModal
            onClose={() => setShowSetup(false)}
            onDone={() => {
              window.vyrix.ai.health().then((r) => setOllamaStatus(r))
            }}
          />
        )}

        <TodoPanel
          isOpen={isTodoOpen}
          onClose={() => setIsTodoOpen(false)}
          firstName={user?.firstName}
        />

        {/* Content area */}
        <div className="relative flex-1 overflow-hidden bg-black">
          {/* GRADIENT 1 — identical to Home page gradient */}
          <div className="pointer-events-none absolute left-[339px] top-[35px] h-[766px] w-[1540px]">
            <div className="absolute" style={{ left: 0, top: 0, width: '100%', height: '385px', opacity: 0.92 }}>
              <img src={imgVector15} alt="" className="absolute block h-full w-full max-w-none" style={{ inset: '-77.92% -19.48%' }} />
            </div>
            <div className="absolute" style={{ left: '314px', top: '207px', width: '875px', height: '205px', opacity: 0.92 }}>
              <img src={imgVector16} alt="" className="absolute block h-full w-full max-w-none" style={{ inset: '-145.97% -34.29%' }} />
            </div>
            <div
              className="absolute rounded-[15px] opacity-[0.92] mix-blend-overlay"
              style={{
                left: '4px',
                top: 0,
                width: '1536px',
                height: '766px',
                backgroundImage: `url("${imgRectangle2}")`,
                backgroundSize: '1024px 1024px',
                backgroundPosition: 'top left',
              }}
            />
            <div className="absolute" style={{ left: '4px', top: '224px', width: '1536px', height: '285px', opacity: 0.92 }}>
              <img src={imgVector17} alt="" className="absolute block h-full w-full max-w-none" style={{ inset: '-105.26% -19.53%' }} />
            </div>
          </div>

          {messages.length === 0 ? (
            /* Centered greeting — only before the first message */
            <div className="absolute inset-0 z-10 flex items-center justify-center px-6 pb-[320px]">
              <div className="text-center">
                <p className="font-unbounded text-[40px] font-medium leading-tight text-[#e7e7e7]">
                  Hi {firstName}!
                </p>
                <p className="font-unbounded text-[40px] font-medium leading-tight text-[#e7e7e7]">
                  Lets get Started
                </p>
              </div>
            </div>
          ) : (
            /* Chat messages — scrollable, above the input bar */
            <div className="absolute inset-x-0 top-0 bottom-[120px] z-10 overflow-y-auto px-[39px] pb-4 pt-8">
              <div className="mx-auto flex max-w-[900px] flex-col gap-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[65%] rounded-[16px] px-5 py-3 text-[15px] leading-[1.6] ${
                        msg.role === 'user'
                          ? 'border border-[rgba(178,197,242,0.25)] bg-[rgba(178,197,242,0.12)] text-white'
                          : 'border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#e7e7e7]'
                      } ${msg.typing ? 'italic opacity-60' : ''}`}
                    >
                      {msg.typing ? (
                        <span className="flex items-center gap-1">
                          <span className="h-[6px] w-[6px] animate-bounce rounded-full bg-[#8d8d97]" style={{ animationDelay: '0ms' }} />
                          <span className="h-[6px] w-[6px] animate-bounce rounded-full bg-[#8d8d97]" style={{ animationDelay: '150ms' }} />
                          <span className="h-[6px] w-[6px] animate-bounce rounded-full bg-[#8d8d97]" style={{ animationDelay: '300ms' }} />
                        </span>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".txt,.md,.csv,.json,.js,.ts,.jsx,.tsx,.py,.java,.c,.cpp,.h,.html,.css,.xml,.yaml,.yml,.log,text/*"
            onChange={handleFileChange}
          />

          {/* Suggestions + Input container — bottom of the content area */}
          <div className="absolute bottom-0 left-[18px] right-[18px] z-10 pb-4">
            {/* TOP SECTION — 2 suggestions; only before the first message */}
            {messages.length === 0 && (
              <div
                className="rounded-tl-[16px] rounded-tr-[16px] border-l border-r border-t"
                style={{ borderColor: 'rgba(255, 255, 255, 0.6)' }}
              >
                <button
                  onClick={() => handleSuggestionClick(SUGGESTIONS[0])}
                  className="w-full cursor-pointer px-[36px] py-[22px] text-left text-[13px] font-normal text-[#adadad] transition-colors hover:bg-[rgba(255,255,255,0.03)] hover:text-white"
                >
                  {SUGGESTIONS[0]}
                </button>

                <div className="h-[1px]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />

                <button
                  onClick={() => handleSuggestionClick(SUGGESTIONS[1])}
                  className="w-full cursor-pointer px-[36px] py-[22px] text-left text-[13px] font-normal text-[#adadad] transition-colors hover:bg-[rgba(255,255,255,0.03)] hover:text-white"
                >
                  {SUGGESTIONS[1]}
                </button>
              </div>
            )}

            {/* BOTTOM SECTION — suggestion 3 (only when empty) + input bar (always) */}
            <div
              className={`rounded-bl-[16px] rounded-br-[16px] border ${
                messages.length === 0 ? '' : 'rounded-tl-[16px] rounded-tr-[16px]'
              }`}
              style={{ borderColor: 'rgba(255, 255, 255, 0.6)' }}
            >
              {messages.length === 0 && (
                <button
                  onClick={() => handleSuggestionClick(SUGGESTIONS[2])}
                  className="w-full cursor-pointer px-[36px] py-[22px] text-left text-[13px] font-normal text-[#adadad] transition-colors hover:bg-[rgba(255,255,255,0.03)] hover:text-white"
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.3)' }}
                >
                  {SUGGESTIONS[2]}
                </button>
              )}

              {/* Attached file pill — shown above input bar when a file is selected */}
              {attachedFile && (
                <div className="flex items-center gap-2 px-[20px] py-[8px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="text-[12px] text-[#a0a0a0]">📎</span>
                  <span className="max-w-[300px] truncate text-[12px] text-[#c0c0c0]">{attachedFile.name}</span>
                  <button
                    onClick={() => setAttachedFile(null)}
                    className="ml-1 text-[14px] leading-none text-[#8d8d97] hover:text-white"
                    title="Remove attachment"
                  >×</button>
                </div>
              )}

              {/* Input bar row */}
              <div className="flex h-[69px] items-center gap-0 px-0">
                {/* Paperclip icon — left */}
                <div
                  className="flex h-full w-[66px] flex-shrink-0 cursor-pointer items-center justify-center"
                  onClick={handleAttachClick}
                >
                  <img
                    src={imgPaperclip1}
                    alt="attach"
                    className="h-[28px] w-[28px] object-cover opacity-80 transition-opacity hover:opacity-100"
                  />
                </div>

                {/* Vertical divider line */}
                <div className="flex h-[26px] w-[1px] flex-shrink-0 items-center justify-center overflow-hidden">
                  <img src={imgLine33} alt="" className="block h-full w-full" />
                </div>

                {/* Text input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  placeholder="Ask anything"
                  className="h-full min-w-0 flex-1 border-none bg-transparent px-[14px] py-0 text-[14px] font-[510] text-white outline-none placeholder:text-[#a0a0a0]"
                  style={{ fontVariationSettings: '"wdth" 100' }}
                />

                {/* Send button — right */}
                <div className="flex h-full w-[69px] flex-shrink-0 items-center justify-center">
                  <button
                    onClick={handleSubmit}
                    disabled={(!inputText.trim() && !attachedFile) || isStreaming}
                    className={`relative h-[45px] w-[45px] flex-shrink-0 transition-all ${
                      (inputText.trim() || attachedFile) && !isStreaming
                        ? 'cursor-pointer opacity-100 hover:scale-105'
                        : 'cursor-default opacity-50'
                    }`}
                  >
                    <img src={imgEllipse7} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <img
                      src={imgGroup136}
                      alt="send"
                      className="absolute h-[16px] w-[15px] object-contain"
                      style={{ left: '15px', top: '15px' }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
