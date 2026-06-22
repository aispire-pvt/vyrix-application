// Slide-in To-Do panel (toggled by the navbar "My To Do" button). All data hardcoded.
// Props: { isOpen, onClose, firstName }

const ongoingTasks = [
  'Survey for SPD 1',
  'Send Untitled 2 for Draft',
  'Make a Whiteboard for Red Sun',
  'Complete Internship Project',
]

const completedTasks = [
  'Survey for SPD 1',
  'Send Untitled 2 for Draft',
  'Make a Whiteboard for Red Sun',
  'Complete Internship Project',
]

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 4v14M4 11h14" stroke="#b2c5f2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="mt-2 text-[13px] font-bold tracking-wide text-[#d5d5d5]">{children}</p>
  )
}

export default function TodoPanel({ isOpen, onClose, firstName }) {
  if (!isOpen) return null

  return (
    <div className="absolute right-0 top-0 z-50 mr-4 mt-[93px] flex h-[543px] w-[415px] flex-col gap-4 rounded-[18px] bg-[#0e0e1a] p-[25px] shadow-2xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h2 className="font-unbounded text-[28px] font-medium text-white">My To-Do</h2>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer text-[20px] text-[#8d8d97] hover:text-white"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Divider */}
      <div className="h-[1px] w-full bg-[rgba(255,255,255,0.1)]" />

      {/* Progress row */}
      <div className="flex items-center gap-3">
        <div className="flex h-[41px] w-[41px] items-center justify-center rounded-full border-2 border-[#b2c5f2]">
          <span className="text-[11px] font-bold text-[#b2c5f2]">3/7</span>
        </div>
        <p className="text-[14px] text-[#d5d5d5]">
          done already - Keep Going {firstName || 'there'}!
        </p>
      </div>

      {/* Add new task */}
      <div className="flex h-[35px] w-full cursor-pointer items-center gap-2 rounded-[11px] border border-[rgba(178,197,242,0.2)] bg-[rgba(178,197,242,0.08)] px-3">
        <PlusIcon />
        <span className="text-[14px] text-[#8d8d97]">Add new task</span>
      </div>

      {/* Task lists */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {/* Ongoing */}
        <SectionLabel>Ongoing</SectionLabel>
        {ongoingTasks.map((task, i) => (
          <div key={`ongoing-${i}`} className="flex items-center gap-3 py-1">
            <span className="h-[17px] w-[17px] flex-shrink-0 rounded-[3px] border border-[rgba(178,197,242,0.4)] bg-transparent" />
            <span className="text-[14px] text-[#d5d5d5]">{task}</span>
          </div>
        ))}

        {/* Completed */}
        <SectionLabel>Completed</SectionLabel>
        {completedTasks.map((task, i) => (
          <div key={`completed-${i}`} className="flex items-center gap-3 py-1">
            <span className="flex h-[17px] w-[17px] flex-shrink-0 items-center justify-center rounded-[3px] border border-[#b2c5f2] bg-[#b2c5f2] text-[10px] font-bold text-black">
              ✓
            </span>
            <span className="text-[14px] text-[#8d8d97] line-through">{task}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
