// "or" divider — centered light text with a thin line on each side.
export default function Divider({ className = '' }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="h-px flex-1 bg-[#6b6b6b]/60" />
      <span className="font-sf text-[20px] font-light text-vyrix-placeholder">
        or
      </span>
      <span className="h-px flex-1 bg-[#6b6b6b]/60" />
    </div>
  )
}
