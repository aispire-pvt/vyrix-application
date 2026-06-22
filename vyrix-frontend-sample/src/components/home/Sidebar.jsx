// Left sidebar for the Home dashboard.
// <Sidebar user={{ firstName: string, profilePic: string | null }} activePage="home" />

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Figma assets (used directly per spec)
const imgUser1 = 'https://www.figma.com/api/mcp/asset/90dd7b4b-58c0-48ad-910e-b606fd5b5a68'
const imgImage5 = 'https://www.figma.com/api/mcp/asset/fc4394c0-b5b0-4cc3-ad18-265a683f89c4'

// Base SVG wrapper — icons inherit color from the nav item via currentColor.
function Icon({ children }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      {children}
    </svg>
  )
}

const HomeIcon = () => (
  <Icon>
    <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </Icon>
)
const FilesIcon = () => (
  <Icon>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </Icon>
)
const StarIcon = () => (
  <Icon>
    <polygon points="12 2.5 15 9 22 9.7 16.5 14.3 18.2 21 12 17.3 5.8 21 7.5 14.3 2 9.7 9 9" />
  </Icon>
)
const AiIcon = () => (
  <Icon>
    <path d="M9 18h6" />
    <path d="M10 21h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2v.3h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z" />
  </Icon>
)
const UsersIcon = () => (
  <Icon>
    <path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" />
    <circle cx="10" cy="8" r="3.2" />
    <path d="M19.5 20v-1.5a3.5 3.5 0 0 0-2.6-3.4" />
    <path d="M15.5 5a3.2 3.2 0 0 1 0 6" />
  </Icon>
)
const FolderIcon = () => (
  <Icon>
    <path d="M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2z" />
  </Icon>
)
const ClockIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 16 14" />
  </Icon>
)
const TodoIcon = () => (
  <Icon>
    <polyline points="9 11 12 14 21 5" />
    <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
  </Icon>
)

const WORKSPACE_ITEMS = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'all-files', label: 'All Files', icon: FilesIcon },
  { key: 'starred', label: 'Starred', icon: StarIcon },
  { key: 'ai', label: 'AI', icon: AiIcon },
  { key: 'community', label: 'Community', icon: UsersIcon },
]

const TEAMSPACE_ITEMS = [
  { key: 'projects', label: 'Projects', icon: FolderIcon },
  { key: 'team-starred', label: 'Starred', icon: StarIcon },
  { key: 'todo', label: 'To do', icon: TodoIcon, beta: true },
  { key: 'recent', label: 'Recent Activity', icon: ClockIcon },
]

function NavItem({ label, icon: ItemIcon, active, beta, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[35px] w-[277px] cursor-pointer items-center gap-3 rounded-[11px] px-3 py-[9px] text-left transition-colors ${
        active
          ? 'bg-[#b2c5f2] font-bold text-black'
          : 'text-[#c7c7c7] hover:bg-[rgba(255,255,255,0.05)]'
      }`}
    >
      <ItemIcon />
      <span className="font-sf text-[14px]">{label}</span>
      {beta && (
        <span className="ml-auto rounded-[5px] bg-[#b2c5f2] px-[6px] py-[1px] text-[9px] font-bold text-black">
          BETA
        </span>
      )}
    </button>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="px-3 font-sf text-[13px] font-bold tracking-[0.13px] text-[#d5d5d5]">
      {children}
    </p>
  )
}

function Divider() {
  return <div className="ml-5 h-px w-[285px] bg-[rgba(178,197,242,0.12)]" />
}

export default function Sidebar({ user, activePage = 'home' }) {
  const firstName = user?.firstName || 'User'
  const avatarSrc = user?.profilePic || imgUser1

  const navigate = useNavigate()
  const [toast, setToast] = useState(false)

  const showArrivingSoon = () => {
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  // Per-item navigation action + the activePage value(s) that highlight it.
  const WORKSPACE_ACTIONS = {
    home: { activeKeys: ['home', 'folder', 'editor'], onClick: () => navigate('/home') },
    'all-files': { activeKeys: ['all-files', 'allfiles'], onClick: () => navigate('/all-files') },
    starred: { activeKeys: ['starred'], onClick: showArrivingSoon },
    ai: { activeKeys: ['ai'], onClick: showArrivingSoon },
    community: { activeKeys: ['community'], onClick: showArrivingSoon },
  }

  return (
    <aside className="relative flex h-screen w-[320px] shrink-0 flex-col bg-black">
      {/* Top: hamburger + logo */}
      <div className="flex items-center gap-4 px-10 pt-[34px]">
        <div className="flex flex-col gap-[6px]">
          <span className="h-[2px] w-[21px] rounded-full bg-white" />
          <span className="h-[2px] w-[21px] rounded-full bg-white" />
          <span className="h-[2px] w-[21px] rounded-full bg-white" />
        </div>
        <img src={imgImage5} alt="Vyrix" className="h-[18px] w-[100px] object-contain" />
      </div>

      {/* User row */}
      <div className="mt-[29px] flex items-center gap-3 px-[25px]">
        <img
          src={avatarSrc}
          alt={firstName}
          className="h-[45px] w-[45px] rounded-full object-cover"
        />
        <span className="font-sf text-[16px] font-[590] text-white">{firstName}</span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mt-[2px]"
        >
          <path d="M1 1L5 5L9 1" stroke="#c7c7c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Workspace */}
      <div className="mt-9 flex flex-col gap-[10px] px-[21px]">
        <SectionLabel>Workspace</SectionLabel>
        {WORKSPACE_ITEMS.map((item) => {
          const action = WORKSPACE_ACTIONS[item.key]
          return (
            <NavItem
              key={item.key}
              label={item.label}
              icon={item.icon}
              active={action.activeKeys.includes(activePage)}
              onClick={action.onClick}
            />
          )
        })}
      </div>

      {/* Divider above Teamspace (y=396) */}
      <div className="mt-5">
        <Divider />
      </div>

      {/* Teamspace — blurred "Arriving soon" */}
      <div className="relative mt-4 px-[21px]">
        <div className="pointer-events-none flex flex-col gap-[10px] opacity-[0.42] blur-[1.5px]">
          <SectionLabel>Teamspace</SectionLabel>
          {TEAMSPACE_ITEMS.map((item) => (
            <NavItem
              key={item.key}
              label={item.label}
              icon={item.icon}
              beta={item.beta}
            />
          ))}
        </div>

        {/* Centered overlay badge */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-[11px] border border-[rgba(178,197,242,0.32)] bg-[rgba(20,24,46,0.55)] px-4 py-2 shadow-lg">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="#b2c5f2" strokeWidth="2" />
              <path d="M12 7v5l3 2" stroke="#b2c5f2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-sf text-[12px] font-bold text-[#b2c5f2]">Arriving soon</span>
          </div>
        </div>
      </div>

      {/* Divider below Teamspace (y=615) */}
      <div className="mt-4">
        <Divider />
      </div>

      {/* Spacer pushes beta card to the bottom */}
      <div className="flex-1" />

      {/* Bottom Beta Card */}
      <div className="mx-[21px] mb-[19px] rounded-[18px] border border-[rgba(178,197,242,0.12)] bg-[rgba(71,67,126,0.54)] p-[19px]">
        <p className="font-unbounded text-[15px] font-medium text-white">V - Beta 1.0</p>
        <p className="mt-2 font-sf text-[12px] leading-[18px] text-[#cfcfdc]">
          Unleash your Research Potential
        </p>
      </div>

      {/* Vertical right-edge divider */}
      <div className="absolute right-0 top-0 h-full w-px bg-[rgba(178,197,242,0.12)]" />

      {/* Arriving soon toast */}
      {toast && (
        <div className="absolute bottom-[230px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-[11px] border border-[rgba(178,197,242,0.32)] bg-[rgba(20,24,46,0.95)] px-4 py-2 shadow-lg transition-opacity duration-300">
          <span className="text-[12px] font-bold tracking-[0.24px] text-[#b2c5f2]">
            Arriving soon
          </span>
        </div>
      )}
    </aside>
  )
}
