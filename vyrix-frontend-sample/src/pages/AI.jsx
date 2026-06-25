import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Sidebar from '../components/home/Sidebar'
import Navbar from '../components/home/Navbar'

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

// AI research-assistant page (Phase 9). Level 1: shell + gradient + greeting.
export default function AI() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isTodoOpen, setIsTodoOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState([])
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const handleSuggestionClick = (text) => {
    setInputText(text)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // Mock AI reply (UI-only — real model wired in a future phase).
  const mockResponse = async () => {
    await new Promise((r) => setTimeout(r, 800))
    const responses = [
      "That's an interesting research direction. Let me help you explore that further.",
      'Based on your research context, here are some key areas to investigate. Start with recent peer-reviewed papers and cross-reference with your existing project notes.',
      'I can help you synthesize information on that topic. What specific aspect interests you most — methodology, findings, or related literature?',
      'Great question for your research. Consider exploring peer-reviewed sources and citation networks to find connected work.',
      "Noted! Let's break this down systematically. First, define the scope, then identify key sources, and finally structure your synthesis.",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleSubmit = async () => {
    const text = inputText.trim()
    if (!text) return
    setInputText('')

    // Add the user message + a typing indicator.
    setMessages((prev) => [...prev, { role: 'user', text }])
    setMessages((prev) => [...prev, { role: 'ai', text: '...', typing: true }])

    // Replace the typing indicator with the mock response.
    const response = await mockResponse(text)
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1 && m.typing ? { role: 'ai', text: response } : m
      )
    )
  }

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

  useEffect(() => {
    let active = true
    api
      .get('/api/auth/me')
      .then((res) => {
        if (!active) return
        setUser(res.data.user)
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login')
        } else {
          setUser({ firstName: '', profilePic: null })
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [navigate])

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

              {/* Input bar row */}
              <div className="flex h-[69px] items-center gap-0 px-0">
                {/* Paperclip icon — left */}
                <div className="flex h-full w-[66px] flex-shrink-0 items-center justify-center">
                  <img
                    src={imgPaperclip1}
                    alt="attach"
                    className="h-[28px] w-[28px] cursor-pointer object-cover opacity-80 transition-opacity hover:opacity-100"
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
                    disabled={!inputText.trim()}
                    className={`relative h-[45px] w-[45px] flex-shrink-0 transition-all ${
                      inputText.trim()
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
