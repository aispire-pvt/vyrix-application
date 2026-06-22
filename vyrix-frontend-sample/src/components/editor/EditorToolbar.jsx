import { useEffect, useReducer } from 'react'

// Props: { editor } — the TipTap editor instance from useEditor()
// If editor is null (not yet initialized) → return null
export default function EditorToolbar({ editor }) {
  // Re-render the toolbar on every editor change so active states stay in sync.
  const [, forceUpdate] = useReducer((x) => x + 1, 0)
  useEffect(() => {
    if (!editor) return
    const update = () => forceUpdate()
    editor.on('transaction', update)
    return () => {
      editor.off('transaction', update)
    }
  }, [editor])

  if (!editor) return null

  const tools = [
    {
      label: 'B',
      title: 'Bold (Ctrl+B)',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
      style: 'font-bold',
    },
    {
      label: 'I',
      title: 'Italic (Ctrl+I)',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
      style: 'italic',
    },
    {
      label: 'H1',
      title: 'Heading 1 (Ctrl+Alt+1)',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
      style: 'text-[11px] font-bold',
    },
    {
      label: 'H2',
      title: 'Heading 2 (Ctrl+Alt+2)',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
      style: 'text-[11px] font-bold',
    },
    {
      label: 'H3',
      title: 'Heading 3 (Ctrl+Alt+3)',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 }),
      style: 'text-[11px] font-bold',
    },
    { type: 'divider' },
    {
      label: '•—',
      title: 'Bullet List (Ctrl+Shift+8)',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
      style: 'text-[14px]',
    },
    {
      label: '1.',
      title: 'Ordered List (Ctrl+Shift+7)',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
      style: 'text-[11px] font-bold',
    },
    { type: 'divider' },
    {
      label: '❝',
      title: 'Blockquote (Ctrl+Shift+B)',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
      style: 'text-[14px]',
    },
    {
      label: '</>',
      title: 'Code Block (Ctrl+Alt+C)',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock'),
      style: 'text-[10px] font-mono font-bold',
    },
    {
      label: '—',
      title: 'Divider',
      action: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: () => false,
      style: 'text-[16px]',
    },
  ]

  return (
    <div className="sticky top-0 z-10 flex w-full items-center gap-[4px] border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-[calc(50%-360px)] py-[10px]">
      {tools.map((tool, i) => {
        if (tool.type === 'divider') {
          return (
            <div
              key={`divider-${i}`}
              className="mx-[4px] h-[20px] w-[1px] bg-[rgba(255,255,255,0.1)]"
            />
          )
        }

        const active = tool.isActive()
        return (
          <button
            key={tool.title}
            title={tool.title}
            onClick={tool.action}
            className={`flex h-[34px] w-[34px] cursor-pointer select-none items-center justify-center rounded-[9px] transition-colors duration-150 ${
              tool.style || 'text-[13px]'
            } ${
              active
                ? 'bg-[#b2c5f2] text-black'
                : 'bg-[rgba(178,197,242,0.05)] text-[#8d8d97] hover:bg-[rgba(178,197,242,0.12)] hover:text-[#d5d5d5]'
            }`}
          >
            {tool.label}
          </button>
        )
      })}
    </div>
  )
}
