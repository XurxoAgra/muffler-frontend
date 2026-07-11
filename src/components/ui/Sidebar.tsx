import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { NavItem } from './NavItem'
import { SignalMark } from '../SignalMark'

const ICON_PROPS = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function ProfileIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  )
}

function CarIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13" />
      <rect x="2" y="13" width="20" height="6" rx="2" />
      <circle cx="7" cy="19" r="1.6" />
      <circle cx="17" cy="19" r="1.6" />
    </svg>
  )
}

function WrenchIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6z" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg {...ICON_PROPS} width={17} height={17}>
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
  vehicleCount?: number
  overdueCount?: number
  onLogout: () => void
  loggingOut: boolean
}

export function Sidebar({ vehicleCount, overdueCount, onLogout, loggingOut }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { t } = useTranslation()

  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { path: '/profile', label: t('nav.profile'), icon: <ProfileIcon />, exact: true },
    {
      path: '/vehicles',
      label: t('nav.vehicles'),
      icon: <CarIcon />,
      exact: true,
      badge: vehicleCount !== undefined && vehicleCount > 0 ? vehicleCount : undefined,
    },
    {
      path: '/mantenimiento',
      label: t('nav.maintenance'),
      icon: <WrenchIcon />,
      exact: false,
      badge: overdueCount !== undefined && overdueCount > 0 ? overdueCount : undefined,
      badgeTone: 'danger' as const,
    },
  ]

  return (
    <aside
      className={`flex flex-shrink-0 flex-row items-center gap-2 rounded-2xl bg-shell px-2 py-2 text-shell-fg md:relative md:flex-col md:items-stretch md:gap-6 md:rounded-none md:bg-transparent md:px-2 md:py-3 ${
        collapsed ? 'md:w-16' : 'md:w-52'
      }`}
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? t('nav.expandMenu') : t('nav.collapseMenu')}
        className={`absolute right-[-14px] top-4 z-30 hidden h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-shell text-muted shadow-lg transition-transform hover:border-lime hover:text-lime md:flex ${
          collapsed ? 'rotate-180' : ''
        }`}
      >
        <ChevronIcon />
      </button>

      <div className={`flex flex-shrink-0 items-center gap-2.5 md:mb-1 ${collapsed ? 'md:justify-center md:px-0' : 'md:px-1'}`}>
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-lime text-black">
          <SignalMark />
        </div>
        <span
          className={`hidden overflow-hidden whitespace-nowrap font-display text-base font-bold text-shell-fg transition-all md:inline-block ${
            collapsed ? 'md:max-w-0 md:opacity-0' : 'md:max-w-[120px] md:opacity-100'
          }`}
        >
          muffler
        </span>
      </div>

      <nav className="flex flex-1 flex-row items-center gap-1 overflow-x-auto md:flex-col md:items-stretch md:gap-1 md:overflow-visible">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            badgeTone={item.badgeTone}
            active={item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)}
            collapsed={collapsed}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        disabled={loggingOut}
        title={t('nav.signOut')}
        className={`flex flex-shrink-0 items-center rounded-lg text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60 ${
          collapsed ? 'justify-center px-2 py-2.5 md:px-0' : 'justify-center gap-2.5 px-2.5 py-2.5 md:justify-start md:px-3.5'
        }`}
      >
        <SignOutIcon />
        <span
          className={`hidden overflow-hidden whitespace-nowrap text-sm transition-all md:inline-block ${
            collapsed ? 'md:max-w-0 md:opacity-0' : 'md:max-w-[200px] md:opacity-100'
          }`}
        >
          {loggingOut ? t('nav.signingOut') : t('nav.signOut')}
        </span>
      </button>
    </aside>
  )
}
