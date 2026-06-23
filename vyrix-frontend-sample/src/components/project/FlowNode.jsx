import docCover from '../../assets/flow/doc-cover.png'

// A single flow node — a white document-preview card with a label (Figma
// 298:3262 / 298:3266). The image uses the design's exact crop (height 228.91%,
// top -54.41%) so the document title shows near the top, skipping the header.
// Props: { flow, isEditMode, labelPosition, onDragStart, onDragOver, onDrop, onClick, onDelete }
export default function FlowNode({
  flow,
  isEditMode,
  labelPosition = 'below',
  onDragStart,
  onDragOver,
  onDrop,
  onClick,
  onDelete,
}) {
  const label = (
    <p className="max-w-[266px] truncate text-center font-sf text-[18px] font-[590] text-[#d5d5d5]">
      {flow.name}
    </p>
  )

  return (
    <div className="flex flex-col items-center gap-2">
      {labelPosition === 'above' && label}

      <div
        draggable={isEditMode}
        onDragStart={onDragStart}
        onDragOver={(e) => {
          e.preventDefault()
          onDragOver?.(e)
        }}
        onDrop={onDrop}
        onClick={onClick}
        className={`relative h-[164px] w-[266px] overflow-hidden rounded-[20px] bg-white shadow-[0px_4px_4.5px_2px_rgba(0,0,0,0.25)] transition-all duration-200 ${
          isEditMode
            ? 'cursor-grab ring-2 ring-[#b2c5f2] active:cursor-grabbing'
            : 'cursor-pointer hover:ring-2 hover:ring-[rgba(178,197,242,0.55)]'
        }`}
      >
        <img
          src={docCover}
          alt=""
          draggable={false}
          className="absolute left-0 w-full max-w-none select-none object-cover"
          style={{ height: '228.91%', top: '-54.41%' }}
        />

        {/* expand-arrows icon top-right (Figma 298:3253) */}
        <div className="absolute right-2 top-2 flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-[rgba(8,9,20,0.45)] backdrop-blur-sm">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </div>

        {/* delete (×) — only in edit mode */}
        {isEditMode && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="absolute left-2 top-2 flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-full bg-[#b80407] text-white shadow-md transition-transform hover:scale-110"
            title="Delete flow"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      {labelPosition === 'below' && label}
    </div>
  )
}
