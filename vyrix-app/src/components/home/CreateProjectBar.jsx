// Full-width blue "Create new project" CTA bar.
// Props: { onClick }
export default function CreateProjectBar({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[#b2c5f2]"
    >
      <svg width="16" height="16" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 4v14M4 11h14" stroke="black" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="text-[14px] font-bold text-black">Create new project</span>
    </div>
  )
}
