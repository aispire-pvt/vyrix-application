import FileTypeIcon from './FileTypeIcon'
import repoBg from '../../assets/flow/repo-bg.jpeg'

// Project-page Flow Repository panel — a clickable card that opens the overlay.
// Empty (no files): centred "Flow Repository" title. Once files exist, it shows
// the "Recently Uploaded" layout (Figma 130:1351).
// Props: { flows, onOpen }
export default function FlowRepository({ flows = [], onOpen }) {
  // Newest files across every flow.
  const recentFiles = flows
    .flatMap((f) => f.files || [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)

  return (
    <button
      onClick={onOpen}
      className="relative block min-h-[290px] w-full overflow-hidden rounded-[20px] border border-[rgba(178,197,242,0.12)] text-left shadow-[1px_4px_7.7px_5px_rgba(0,0,0,0.25)] transition-colors hover:border-[rgba(178,197,242,0.35)]"
    >
      {/* Black hole backdrop with dark gradient overlay for legibility */}
      <img src={repoBg} alt="" className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {recentFiles.length === 0 ? (
        /* Empty state — centred title (Figma 298:2929) */
        <div className="relative flex h-[290px] items-center justify-center">
          <p className="font-sf text-[32px] font-bold text-white drop-shadow-lg">Flow Repository</p>
        </div>
      ) : (
        <div className="relative flex h-full min-h-[290px] flex-col p-7">
          {/* Header: title (left) + Recently Uploaded (right) */}
          <div className="flex items-start justify-between">
            <p className="font-sf text-[30px] font-bold text-white">Flow Repository</p>
            <div className="pt-1 text-right">
              <p className="font-sf text-[14px] text-[#d5d5d5]">Recently Uploaded</p>
              <div className="mt-1 h-px w-[131px] bg-[rgba(255,255,255,0.35)]" />
            </div>
          </div>

          {/* Recent files row + Open Repo */}
          <div className="mt-auto flex items-end gap-7 pt-8">
            {recentFiles.map((file) => (
              <div key={file.id} className="flex w-[96px] flex-col items-center gap-2">
                <FileTypeIcon type={file.type} name={file.name} size={72} />
                <p className="w-full truncate text-center font-sf text-[14px] font-[590] text-white">{file.name}</p>
                <p className="text-center font-sf text-[12px] capitalize text-[#d5d5d5]">{file.type}</p>
              </div>
            ))}

            {/* Open Repo affordance */}
            <div className="ml-auto flex flex-col items-center gap-1 self-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d5d5d5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
              <span className="font-sf text-[12px] text-[#8d8d97]">Open Repo</span>
            </div>
          </div>
        </div>
      )}
    </button>
  )
}
