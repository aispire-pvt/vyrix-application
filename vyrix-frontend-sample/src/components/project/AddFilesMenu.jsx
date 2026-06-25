import { useRef } from 'react'

// Props: { onCreateDocument, onAddLink, onAddFile, onCanva, onFigma, onClose }
export default function AddFilesMenu({ onCreateDocument, onAddLink, onAddFile, onCanva, onFigma, onClose }) {
  const fileInputRef = useRef(null)

  const items = [
    {
      label: 'Create Document File',
      external: false,
      action: () => {
        onCreateDocument()
        onClose()
      },
    },
    {
      label: 'Make a file on Canva',
      external: true,
      action: () => {
        onCanva()
        onClose()
      },
    },
    {
      label: 'Make a file on Figma',
      external: true,
      action: () => {
        onFigma()
        onClose()
      },
    },
    {
      label: 'Add a link',
      external: false,
      action: () => {
        onAddLink()
        onClose()
      },
    },
    {
      label: 'Add a file',
      external: false,
      action: () => {
        fileInputRef.current?.click()
        onClose()
      },
    },
  ]

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onAddFile(e.target.files[0])
          }
        }}
      />

      {/* Backdrop — clicking outside closes */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu — frosted translucent panel, centered items (Figma 298:3120) */}
      <div className="absolute right-0 top-full z-50 mt-2 w-[284px] overflow-hidden rounded-[20px] border border-[rgba(125,125,125,0.8)] bg-[rgba(119,119,121,0.26)] shadow-[1px_4px_7.7px_5px_rgba(0,0,0,0.25)] backdrop-blur-md">
        {items.map((item, i) => (
          <div key={item.label}>
            <button
              onClick={item.action}
              className="relative flex w-full cursor-pointer items-center justify-center px-5 py-[14px] text-center font-sf text-[16px] font-[590] text-white transition-colors hover:bg-[rgba(255,255,255,0.08)]"
            >
              {item.label}
              {item.external && (
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 4h6v6" />
                  <path d="M20 4l-9 9" />
                  <path d="M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
                </svg>
              )}
            </button>
            {i < items.length - 1 && <div className="h-[1px] bg-[rgba(255,255,255,0.22)]" />}
          </div>
        ))}
      </div>
    </>
  )
}
