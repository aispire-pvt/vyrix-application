// Reusable document card (Recent Activity + bottom recent files rows).
// Props: { title, timestamp, thumbnail, coverIndex, size = 'large', onClick, onMoveClick }
//   size='large' → w-[339px] h-[191px]   size='small' → w-[266px] h-[166px]
//   Always renders a cover image: an explicit `thumbnail`, else the doc's
//   assigned cover from the COVER_IMAGES pool (via coverIndex).

import { getCoverImage } from '../../utils/coverImages'

const SIZES = {
  large: 'w-[339px] h-[191px]',
  small: 'w-[266px] h-[166px]',
}

function HoverButton({ children, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => e.stopPropagation()}
      className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border border-[rgba(255,255,255,0.14)] bg-[rgba(10,12,26,0.55)] text-[13px] text-white backdrop-blur-[3px]"
    >
      {children}
    </button>
  )
}

export default function DocumentCard({
  title,
  timestamp,
  thumbnail,
  coverIndex,
  size = 'large',
  onClick,
  onMoveClick,
}) {
  const isLarge = size === 'large'
  const coverSrc = thumbnail || getCoverImage(coverIndex)

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
    >
      {/* Card surface */}
      <div
        className={`relative overflow-hidden rounded-[20px] border border-transparent transition-colors duration-200 group-hover:border-[rgba(178,197,242,0.2)] ${SIZES[size]}`}
      >
        <img
          src={coverSrc}
          alt={title || 'Untitled'}
          className="absolute inset-0 h-full w-full rounded-[20px] object-cover"
        />

        {/* Hover actions */}
        <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <HoverButton label="Star">★</HoverButton>
          <button
            type="button"
            title="Move to folder"
            aria-label="Move to folder"
            onClick={(e) => {
              e.stopPropagation()
              onMoveClick?.()
            }}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border border-[rgba(255,255,255,0.14)] bg-[rgba(10,12,26,0.55)] backdrop-blur-[3px] transition-colors hover:bg-[rgba(178,197,242,0.2)]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 3.5h4l1.5 2H13M1 3.5v8h12v-6" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Label below */}
      <p
        className={`mt-2 text-[16px] font-[510] ${
          isLarge ? 'text-white' : 'text-[#d5d5d5]'
        }`}
      >
        {title || 'Untitled'}
      </p>
      {isLarge && timestamp && (
        <p className="text-[12px] font-normal text-[#d5d5d5]">{timestamp}</p>
      )}
    </div>
  )
}
