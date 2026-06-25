import DocumentCard from './DocumentCard'
import { relativeTime } from '../../utils/relativeTime'

// GRADIENT 1 — exact Figma render of the blue glow + grain (node 61:8)
import headerGlow from '../../assets/home/header-glow.png'

// Gradient header: greeting + Recent Activity row.
// Props: { firstName, docs, onOpenDoc, onMoveDoc }
export default function GreetingHeader({ firstName, docs = [], onOpenDoc, onMoveDoc }) {
  const recent = docs.slice(0, 4)

  return (
    <div className="relative w-full overflow-hidden rounded-[15px] bg-black">
      {/* GRADIENT 1 — exact Figma render (blue glow), laid over black.
          Bottom is masked to fade into black so there's no hard edge. */}
      <img
        src={headerGlow}
        alt=""
        className="pointer-events-none absolute inset-x-0 top-0 w-full select-none"
        style={{
          maskImage: 'linear-gradient(to bottom, black 45%, transparent 78%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 45%, transparent 78%)',
        }}
      />

      <div className="relative z-10 pl-[39px] pt-[32px]">
        {/* Greeting */}
        <h1 className="font-unbounded text-[28px] font-medium leading-tight text-[#e7e7e7]">
          Hi {firstName || 'there'}!
          <br />
          What are you up to?
        </h1>

        {/* Recent Activity */}
        <p className="mb-3 mt-[36px] text-[15px] font-[590] text-[#d5d5d5]">
          Recent Activity
        </p>

        {recent.length === 0 ? (
          <div className="flex h-[148px] w-full max-w-[1416px] flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-[rgba(178,197,242,0.15)]">
            <div className="text-[22px]">📄</div>
            <p className="text-[12px] text-[#4a4a5a]">No documents yet</p>
            <p className="text-[11px] text-[#3a3a4a]">
              Hit "Create new project" above to get started
            </p>
          </div>
        ) : (
          <div className="flex gap-[14px]">
            {recent.map((doc) => (
              <DocumentCard
                key={doc.id}
                size="large"
                title={doc.title}
                coverIndex={doc.cover_index}
                timestamp={relativeTime(doc.updated_at)}
                onClick={() => onOpenDoc?.(doc.id)}
                onMoveClick={() => onMoveDoc?.(doc)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
