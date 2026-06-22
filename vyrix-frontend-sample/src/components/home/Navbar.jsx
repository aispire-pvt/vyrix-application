// Top navbar for the Home dashboard: document tabs + "My To Do" toggle.
// <Navbar onToggleTodo={() => {}} isTodoOpen={false} />

// Figma asset (used directly per spec)
const imgGroup34 = 'https://www.figma.com/api/mcp/asset/bf7ddc28-ab81-4703-bb3a-c96f8b81486c'

const INACTIVE_TABS = ['Red Sun new', 'Untitled New', 'Red Sun 4']

function Tab({ label, active }) {
  return (
    <div
      className={`flex h-[36px] items-center gap-2 rounded-tl-[9px] rounded-tr-[9px] px-[19px] ${
        active
          ? 'bg-[#b2c5f2] font-bold text-black'
          : 'bg-[rgba(118,114,149,0.14)] font-normal text-[#8d8d97]'
      }`}
    >
      <span className="font-sf text-[14px] whitespace-nowrap">{label}</span>
      <button
        type="button"
        className="flex h-[16px] w-[16px] items-center justify-center text-[14px] leading-none"
        aria-label={`Close ${label}`}
      >
        ×
      </button>
    </div>
  )
}

export default function Navbar({ onToggleTodo, activeTabTitle }) {
  return (
    <div className="shrink-0">
      <div className="flex h-[78px] items-end justify-between pl-[20px] pr-[28px]">
        {/* Document tabs — bottom-anchored, opening upward */}
        <div className="flex items-end gap-[6px]">
          <Tab label={activeTabTitle || 'Untitled 1'} active />
          {INACTIVE_TABS.map((label) => (
            <Tab key={label} label={label} />
          ))}
          <button
            type="button"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] text-[18px] text-[#8d8d97]"
            aria-label="New tab"
          >
            +
          </button>
        </div>

        {/* My To Do button — vertically centered */}
        <button
          type="button"
          onClick={onToggleTodo}
          className="flex h-[50px] w-[158px] items-center justify-center gap-2 self-center rounded-[20px] border border-[#8c8c8c] bg-[#b2c5f2]"
        >
          <img src={imgGroup34} alt="" className="h-[18px] w-[18px] object-contain" />
          <span className="text-[16px] font-[510] text-black">My To Do</span>
        </button>
      </div>

      {/* Separator below the tab strip */}
      <div className="h-[1px] w-full bg-[rgba(255,255,255,0.1)]" />
    </div>
  )
}
