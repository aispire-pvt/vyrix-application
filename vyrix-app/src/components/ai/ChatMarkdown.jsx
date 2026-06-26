import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Renders an AI message as styled markdown (headings, bold, lists, code, etc.).
// react-markdown sanitizes by default — no raw HTML is executed, so model output
// can't inject markup. Links open in the system browser via the openFile bridge.
//
// `tone` adapts to the bubble background:
//   'dark'  — /ai page (dark bubble, light text)
//   'light' — in-editor chatbot (light bubble, black text)
// Text color is inherited from the parent bubble; only accents differ by tone.

function makeComponents(tone) {
  const dark = tone === 'dark'
  const codeInline = dark ? 'bg-[rgba(255,255,255,0.10)]' : 'bg-[rgba(0,0,0,0.08)]'
  const codeBlock  = dark ? 'bg-[rgba(0,0,0,0.35)]'       : 'bg-[rgba(0,0,0,0.06)]'
  const link       = dark ? 'text-[#b2c5f2]'              : 'text-[#3b5bdb]'
  const quote      = dark ? 'border-[rgba(178,197,242,0.4)]' : 'border-[rgba(0,0,0,0.25)]'

  return {
    h1: ({ children }) => <h1 className="mb-2 mt-3 text-[1.2em] font-bold first:mt-0">{children}</h1>,
    h2: ({ children }) => <h2 className="mb-2 mt-3 text-[1.12em] font-bold first:mt-0">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-1.5 mt-3 text-[1.05em] font-bold first:mt-0">{children}</h3>,
    p:  ({ children }) => <p className="mb-2 leading-[1.65] last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
    ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
    li: ({ children }) => <li className="leading-[1.6]">{children}</li>,
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    a: ({ href, children }) => (
      <a
        onClick={(e) => { e.preventDefault(); if (href) window.vyrix?.openFile?.({ url: href }) }}
        href={href}
        className={`cursor-pointer underline underline-offset-2 ${link}`}
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className={`mb-2 border-l-2 pl-3 opacity-90 last:mb-0 ${quote}`}>{children}</blockquote>
    ),
    // react-markdown v9 dropped the `inline` prop, so detect block code by a
    // language class or a newline in the content (works across versions).
    code: ({ className, children }) => {
      const isBlock = (className && className.includes('language-')) || String(children ?? '').includes('\n')
      return isBlock ? (
        <code className={`block overflow-x-auto rounded-[8px] p-3 font-mono text-[0.85em] leading-[1.5] ${codeBlock}`}>{children}</code>
      ) : (
        <code className={`rounded px-1.5 py-0.5 font-mono text-[0.88em] ${codeInline}`}>{children}</code>
      )
    },
    pre: ({ children }) => <pre className="mb-2 last:mb-0">{children}</pre>,
    hr: () => <hr className="my-3 opacity-20" />,
  }
}

const DARK_COMPONENTS  = makeComponents('dark')
const LIGHT_COMPONENTS = makeComponents('light')

export default function ChatMarkdown({ children, tone = 'dark' }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={tone === 'light' ? LIGHT_COMPONENTS : DARK_COMPONENTS}
      >
        {children || ''}
      </ReactMarkdown>
    </div>
  )
}
