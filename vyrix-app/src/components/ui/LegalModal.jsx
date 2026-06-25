import { useEffect, useRef, useState } from 'react'

// Scrollable legal-document modal.
// Props: title, children (text content), onClose
export default function LegalModal({ title, children, onClose }) {
  const bodyRef = useRef(null)
  const [atBottom, setAtBottom] = useState(false)

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const check = () => setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 8)
    check()
    el.addEventListener('scroll', check)
    return () => el.removeEventListener('scroll', check)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="flex h-[80vh] w-full max-w-2xl flex-col rounded-2xl border border-white/10 bg-[#111] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="font-unbounded text-[18px] font-medium text-white">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#a3a3a3] hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto px-6 py-4 font-sf text-[14px] leading-relaxed text-[#c7c7c7]"
        >
          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
          {!atBottom && (
            <span className="font-sf text-[12px] text-[#6b6b6b]">Scroll to read the full document</span>
          )}
          <button
            onClick={onClose}
            className="ml-auto rounded-xl bg-[#b2c5f2] px-6 py-2 font-sf text-[14px] font-bold text-[#0e1022] transition hover:bg-[#c5d4f5]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
