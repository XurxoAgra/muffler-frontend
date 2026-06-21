import { useState } from 'react'
import { NavItem } from './NavItem'
import { SignalMark } from '../SignalMark'

const ICON_PROPS = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function DashboardIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

interface SidebarProps {
  initials: string
  name: string
  role: string
  onLogout: () => void
  loggingOut: boolean
}

export function Sidebar({ initials, name, role, onLogout, loggingOut }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`relative z-20 flex flex-shrink-0 flex-col border-r border-white/10 bg-bg transition-[width] duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div
        className={`pointer-events-none absolute bottom-[120px] top-[88px] w-px bg-gradient-to-b from-transparent via-white/5 to-transparent transition-all duration-200 ${
          collapsed ? 'left-1/2' : 'left-7'
        }`}
      />

      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? 'Expand menu' : 'Collapse menu'}
        className={`absolute right-[-14px] top-7 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-bg text-muted shadow-lg transition-transform hover:border-lime hover:text-lime ${
          collapsed ? 'rotate-180' : ''
        }`}
      >
        <ChevronIcon />
      </button>

      <div className={`flex items-center gap-2.5 border-b border-white/10 ${collapsed ? 'justify-center px-0 py-5' : 'px-5 py-5'}`}>
        <span className="text-lime">
          <SignalMark />
        </span>
        <span
          className={`overflow-hidden whitespace-nowrap font-display text-base font-semibold transition-all ${
            collapsed ? 'max-w-0 opacity-0' : 'max-w-[120px] opacity-100'
          }`}
        >
          muffler
        </span>
        {!collapsed && <span className="ml-auto flex-shrink-0 font-mono text-[10px] tracking-widest text-muted">v0.1</span>}
      </div>

      <nav className={`flex flex-1 flex-col gap-1 overflow-x-hidden ${collapsed ? 'px-2 py-3.5' : 'px-3 py-3.5'}`}>
        {!collapsed && (
          <div className="mb-2 px-3.5 font-mono text-[8px] font-semibold uppercase tracking-[0.24em] text-subtle">Nav</div>
        )}
        <NavItem icon={<DashboardIcon />} label="Dashboard" disabled collapsed={collapsed} />
        <NavItem icon={<ProfileIcon />} label="Profile" active collapsed={collapsed} />
        <NavItem icon={<SettingsIcon />} label="Settings" disabled collapsed={collapsed} />
      </nav>

      <div className={`border-t border-white/10 ${collapsed ? 'px-2 py-4' : 'px-3 py-4'}`}>
        {!collapsed && (
          <div className="mb-1.5 flex items-center gap-2.5 overflow-hidden rounded-lg bg-white/[0.02] px-3.5 py-2.5">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-lime-20 bg-lime-10 font-display text-xs font-bold text-lime">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-white">{name}</div>
              <div className="font-mono text-[10px] tracking-wider text-muted">{role}</div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          title={collapsed ? 'Sign out' : undefined}
          className={`flex w-full items-center rounded-lg text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60 ${
            collapsed ? 'justify-center px-0 py-2.5' : 'justify-start gap-2.5 px-3.5 py-2.5'
          }`}
        >
          <SignOutIcon />
          <span
            className={`overflow-hidden whitespace-nowrap text-sm transition-all ${
              collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
            }`}
          >
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </span>
        </button>
      </div>
    </aside>
  )
}
