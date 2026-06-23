// Top navbar: dynamic browser-style tabs + "My To Do" toggle.
// Tabs come from the shared TabsContext (persisted, works across pages).
// <Navbar onToggleTodo={() => {}} isTodoOpen={false} activeTabTitle="..." />

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTabs } from '../../context/TabsContext'

// Figma asset (used directly per spec)
const imgGroup34 = 'https://www.figma.com/api/mcp/asset/bf7ddc28-ab81-4703-bb3a-c96f8b81486c'

// Fallback tab label for pages that don't pass an explicit title.
function defaultTitle(pathname) {
  if (pathname === '/home') return 'Home'
  if (pathname === '/all-files') return 'All Files'
  if (pathname === '/ai') return 'AI'
  if (pathname.startsWith('/folder/')) return 'Folder'
  if (pathname.startsWith('/project/')) return 'Project'
  if (pathname.startsWith('/doc/')) return 'Untitled'
  return 'Tab'
}

function Tab({ label, active, onClick, onClose }) {
  return (
    <div
      onClick={onClick}
      className={`flex h-[36px] max-w-[200px] cursor-pointer items-center gap-2 rounded-tl-[9px] rounded-tr-[9px] px-[19px] ${
        active
          ? 'bg-[#b2c5f2] font-bold text-black'
          : 'bg-[rgba(118,114,149,0.14)] font-normal text-[#8d8d97] hover:bg-[rgba(118,114,149,0.24)]'
      }`}
    >
      <span className="truncate font-sf text-[14px]">{label}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="flex h-[16px] w-[16px] shrink-0 cursor-pointer items-center justify-center rounded-full text-[14px] leading-none hover:bg-[rgba(0,0,0,0.12)]"
        aria-label={`Close ${label}`}
      >
        ×
      </button>
    </div>
  )
}

export default function Navbar({ onToggleTodo, activeTabTitle }) {
  const { pathname } = useLocation()
  const { tabs, activeId, syncActive, newTab, selectTab, closeTab } = useTabs()

  // Keep the active tab pointed at the current route + title.
  useEffect(() => {
    syncActive(pathname, activeTabTitle || defaultTitle(pathname))
  }, [pathname, activeTabTitle, syncActive])

  return (
    <div className="shrink-0">
      <div className="flex h-[78px] items-end justify-between pl-[20px] pr-[28px]">
        {/* Tabs — bottom-anchored, scroll horizontally if they overflow */}
        <div className="flex items-end gap-[6px] overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              label={tab.title}
              active={tab.id === activeId}
              onClick={() => selectTab(tab.id)}
              onClose={() => closeTab(tab.id)}
            />
          ))}
          <button
            type="button"
            onClick={newTab}
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] text-[18px] text-[#8d8d97] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-white"
            aria-label="New tab"
          >
            +
          </button>
        </div>

        {/* My To Do button — vertically centered */}
        <button
          type="button"
          onClick={onToggleTodo}
          className="ml-4 flex h-[50px] w-[158px] shrink-0 items-center justify-center gap-2 self-center rounded-[20px] border border-[#8c8c8c] bg-[#b2c5f2]"
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
