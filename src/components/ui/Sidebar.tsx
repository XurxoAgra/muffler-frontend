import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { NavItem } from './NavItem'
import { SignalMark } from '../SignalMark'
import { useTheme } from '../../theme/ThemeContext'

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

function ProfileIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function CarIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M19 17H5a2 2 0 0 1-2-2V9l2-5h14l2 5v6a2 2 0 0 1-2 2z" />
      <circle cx="7.5" cy="17" r="2.5" />
      <circle cx="16.5" cy="17" r="2.5" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
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

function MenuIcon() {
  return (
    <svg {...ICON_PROPS} width={18} height={18}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg {...ICON_PROPS} width={14} height={14}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { path: '/profile', label: 'Profile', icon: <ProfileIcon /> },
    { path: '/vehicles', label: 'Vehicles', icon: <CarIcon /> },
  ]

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  return (
    <>
      <header className="flex flex-shrink-0 items-center gap-3 border-b border-white/10 bg-bg px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-white"
        >
          <MenuIcon />
        </button>

        <span className="text-lime">
          <SignalMark />
        </span>
        <span className="font-display text-base font-semibold">muffler</span>

        <div className="ml-auto flex items-center gap-2.5">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-lime-20 bg-lime-10 font-display text-xs font-bold text-lime">
            {initials}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-white"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            title="Sign out"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SignOutIcon />
          </button>
        </div>
      </header>

      <div className={`fixed inset-0 z-40 md:hidden ${drawerOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setDrawerOpen(false)}
        />

        <div
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col border-r border-white/10 bg-bg shadow-2xl transition-transform duration-200 ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
            <span className="text-lime">
              <SignalMark />
            </span>
            <span className="font-display text-base font-semibold">muffler</span>
            <span className="ml-auto font-mono text-[10px] tracking-widest text-muted">v0.1</span>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/10 text-muted transition-colors hover:border-lime hover:text-lime"
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-3 py-3.5">
            <div className="mb-2 px-3.5 font-mono text-[8px] font-semibold uppercase tracking-[0.24em] text-subtle">Nav</div>
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path)
                  setDrawerOpen(false)
                }}
              />
            ))}
          </nav>

          <div className="border-t border-white/10 px-3 py-4">
            <div className="mb-1.5 flex items-center gap-2.5 overflow-hidden rounded-lg bg-white/[0.02] px-3.5 py-2.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-lime-20 bg-lime-10 font-display text-xs font-bold text-lime">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-white">{name}</div>
                <div className="font-mono text-[10px] tracking-wider text-muted">{role}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center justify-start gap-2.5 rounded-lg px-3.5 py-2.5 text-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              <span className="text-sm">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              disabled={loggingOut}
              className="flex w-full items-center justify-start gap-2.5 rounded-lg px-3.5 py-2.5 text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SignOutIcon />
              <span className="text-sm">{loggingOut ? 'Signing out…' : 'Sign out'}</span>
            </button>
          </div>
        </div>
      </div>

      <aside
        className={`relative z-20 hidden flex-shrink-0 flex-col border-r border-white/10 bg-bg transition-[width] duration-200 md:flex ${
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
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.path}
              collapsed={collapsed}
              onClick={() => navigate(item.path)}
            />
          ))}
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
            onClick={toggleTheme}
            title={collapsed ? (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode') : undefined}
            className={`flex w-full items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-white ${
              collapsed ? 'justify-center px-0 py-2.5' : 'justify-start gap-2.5 px-3.5 py-2.5'
            }`}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            <span
              className={`overflow-hidden whitespace-nowrap text-sm transition-all ${
                collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
              }`}
            >
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            title={collapsed ? 'Sign out' : undefined}
            className={`mt-1 flex w-full items-center rounded-lg text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60 ${
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
    </>
  )
}
