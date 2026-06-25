import { useEffect, useReducer, useRef, useState } from 'react'
import aiIcon from '../../assets/editor/ai.png'

const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '30', '36']

// Props: { editor, onAI, aiActive }
export default function EditorToolbar({ editor, onAI, aiActive }) {
  // Re-render the toolbar on every editor change so active states stay in sync.
  const [, forceUpdate] = useReducer((x) => x + 1, 0)
  const [sizeOpen, setSizeOpen] = useState(false)
  const sizeRef = useRef(null)

  useEffect(() => {
    if (!editor) return
    const update = () => forceUpdate()
    editor.on('transaction', update)
    return () => editor.off('transaction', update)
  }, [editor])

  // Close the font-size menu on outside click.
  useEffect(() => {
    const onDown = (e) => {
      if (sizeRef.current && !sizeRef.current.contains(e.target)) setSizeOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  if (!editor) return null

  // Current font size (number only) for the dropdown label.
  const currentSize = (editor.getAttributes('textStyle').fontSize || '16px').replace('px', '')

  const setLink = () => {
    const prev = editor.getAttributes('link').href
    const url = window.prompt('Enter URL', prev || 'https://')
    if (url === null) return
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    // Apply the link to the selected text, then collapse the cursor to the end
    // of it so the selection clears and you can keep typing normal (unlinked) text.
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
    const end = editor.state.selection.to
    editor.chain().focus().setTextSelection(end).unsetMark('link').run()
  }

  // A single toolbar button (dark rounded square; blue when active).
  const Btn = ({ active, onClick, title, children, className = '' }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-[35px] w-[35px] shrink-0 cursor-pointer select-none items-center justify-center rounded-[9px] transition-colors duration-150 ${
        active
          ? 'bg-[#b2c5f2] text-black'
          : 'bg-[rgba(255,255,255,0.05)] text-[#cfcfdc] hover:bg-[rgba(255,255,255,0.1)]'
      } ${className}`}
    >
      {children}
    </button>
  )

  const Divider = () => <div className="mx-[5px] h-[22px] w-px bg-[rgba(255,255,255,0.14)]" />

  return (
    <div className="sticky top-0 z-10 w-full border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] py-[8px]">
      <div className="flex flex-wrap items-center justify-center gap-[6px] px-4">
        {/* Font size dropdown */}
        <div className="relative" ref={sizeRef}>
          <button
            type="button"
            title="Font size"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setSizeOpen((v) => !v)}
            className="flex h-[35px] cursor-pointer select-none items-center gap-2 rounded-[9px] bg-[rgba(255,255,255,0.05)] px-3 text-[14px] text-[#cfcfdc] transition-colors hover:bg-[rgba(255,255,255,0.1)]"
          >
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {currentSize}
          </button>
          {sizeOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-[72px] overflow-hidden rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[#16171d] py-1 shadow-[0px_12px_40px_rgba(0,0,0,0.6)]">
              {FONT_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    editor.chain().focus().setFontSize(`${s}px`).run()
                    setSizeOpen(false)
                  }}
                  className={`flex w-full cursor-pointer items-center px-4 py-[6px] text-[14px] transition-colors hover:bg-[rgba(255,255,255,0.08)] ${
                    currentSize === s ? 'text-[#b2c5f2]' : 'text-[#cfcfdc]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* B / I / U */}
        <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)">
          <span className="text-[15px] font-bold">B</span>
        </Btn>
        <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)">
          <span className="text-[15px] italic">I</span>
        </Btn>
        <Btn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)">
          <span className="text-[15px] underline underline-offset-2">U</span>
        </Btn>

        {/* H1 / H2 / H3 */}
        {[1, 2, 3].map((level) => (
          <Btn
            key={level}
            active={editor.isActive('heading', { level })}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            title={`Heading ${level}`}
          >
            <span className="text-[12px] font-bold">H{level}</span>
          </Btn>
        ))}

        <Divider />

        {/* Lists */}
        <Btn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="9" y1="6" x2="20" y2="6" />
            <line x1="9" y1="12" x2="20" y2="12" />
            <line x1="9" y1="18" x2="20" y2="18" />
            <circle cx="4.5" cy="6" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="4.5" cy="12" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="4.5" cy="18" r="1.4" fill="currentColor" stroke="none" />
          </svg>
        </Btn>
        <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="10" y1="6" x2="20" y2="6" />
            <line x1="10" y1="12" x2="20" y2="12" />
            <line x1="10" y1="18" x2="20" y2="18" />
            <text x="2" y="8.5" fontSize="7" fontWeight="700" fill="currentColor" stroke="none">1</text>
            <text x="2" y="20" fontSize="7" fontWeight="700" fill="currentColor" stroke="none">2</text>
          </svg>
        </Btn>

        <Divider />

        {/* Quote / Code / HR */}
        <Btn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">
          <span className="text-[18px] font-bold leading-none">”</span>
        </Btn>
        <Btn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
          <span className="font-mono text-[11px] font-bold">&lt;/&gt;</span>
        </Btn>
        <Btn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="12" x2="20" y2="12" />
          </svg>
        </Btn>

        {/* Link */}
        <Btn active={editor.isActive('link')} onClick={setLink} title="Insert link">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </Btn>

        {/* AI — opens the chat panel */}
        <button
          type="button"
          title="AI Assistant"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onAI}
          className={`flex h-[35px] w-[35px] shrink-0 cursor-pointer select-none items-center justify-center rounded-[9px] transition-colors ${
            aiActive
              ? 'bg-[rgba(178,197,242,0.28)] ring-1 ring-[#b2c5f2]'
              : 'bg-[rgba(178,197,242,0.08)] hover:bg-[rgba(178,197,242,0.16)]'
          }`}
        >
          <img src={aiIcon} alt="AI" className="h-[20px] w-[20px]" />
        </button>
      </div>
    </div>
  )
}
