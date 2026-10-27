import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { NavItem, NavLabel } from './NavItem'
import { MobileMenu, type MenuItem } from './MobileMenu'
import { MufflerIcon } from '../MufflerLogo'
import BuildOutlined from '@mui/icons-material/BuildOutlined'
import ChevronLeftOutlined from '@mui/icons-material/ChevronLeftOutlined'
import DirectionsCarOutlined from '@mui/icons-material/DirectionsCarOutlined'
import LogoutOutlined from '@mui/icons-material/LogoutOutlined'
import PersonOutlined from '@mui/icons-material/PersonOutlined'
import ShowChartOutlined from '@mui/icons-material/ShowChartOutlined'

function ProfileIcon() {
  return <PersonOutlined sx={{ fontSize: 18 }} />
}

function ChartIcon() {
  return <ShowChartOutlined sx={{ fontSize: 18 }} />
}

function CarIcon() {
  return <DirectionsCarOutlined sx={{ fontSize: 18 }} />
}

function WrenchIcon() {
  return <BuildOutlined sx={{ fontSize: 18 }} />
}

function SignOutIcon() {
  return <LogoutOutlined sx={{ fontSize: 17 }} />
}

function ChevronIcon() {
  return <ChevronLeftOutlined sx={{ fontSize: 16 }} />
}

// Same geometry as NavItem: a fixed left inset keeps every icon centred in the collapsed rail.
const ROW = 'flex w-full items-center gap-3 rounded-lg py-2.5 pl-[15px] pr-3.5'

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

  const navDefs = [
    { path: '/resumen', label: t('nav.summary'), icon: <ChartIcon />, exact: true },
    {
      path: '/vehicles',
      label: t('nav.vehicles'),
      icon: <CarIcon />,
      exact: false,
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
    { path: '/profile', label: t('nav.profile'), icon: <ProfileIcon />, exact: true },
  ]
  const navItems: MenuItem[] = navDefs.map(({ exact, ...item }) => ({
    ...item,
    active: exact ? location.pathname === item.path : location.pathname.startsWith(item.path),
  }))

  return (
    <>
      <MobileMenu items={navItems} onNavigate={(path) => navigate(path)} onLogout={onLogout} loggingOut={loggingOut} />
      {/* Width is the one layout property animated here: the main area has to reflow to follow it either way. */}
      <aside
        className={`hidden flex-shrink-0 flex-col gap-6 overflow-hidden px-2 py-3 text-shell-fg transition-[width] duration-(--motion-slow) ease-in-out-soft lg:flex ${
          collapsed ? 'w-16' : 'w-52'
        }`}
      >
        <div className="mb-1 flex flex-shrink-0 items-center gap-2.5 pl-2">
          <MufflerIcon size={32} title="" />
          <NavLabel collapsed={collapsed} className="font-display text-base font-bold text-shell-fg">
            muffler
          </NavLabel>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              badgeTone={item.badgeTone}
              active={item.active}
              collapsed={collapsed}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        <div className="flex flex-shrink-0 flex-col gap-1 border-t border-shell-fg/10 pt-3">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? t('nav.expandMenu') : t('nav.collapseMenu')}
            title={collapsed ? t('nav.expandMenu') : undefined}
            className={`${ROW} cursor-pointer text-muted transition-colors hover:bg-shell-fg/5 hover:text-shell-fg-hover`}
          >
            <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center">
              <span className={`flex transition-transform duration-(--motion-slow) ease-in-out-soft ${collapsed ? 'rotate-180' : ''}`}>
                <ChevronIcon />
              </span>
            </span>
            <NavLabel collapsed={collapsed} className="text-sm">
              {t('nav.collapseMenu')}
            </NavLabel>
          </button>

          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            title={collapsed ? t('nav.signOut') : undefined}
            className={`${ROW} cursor-pointer text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span className="flex-shrink-0">
              <SignOutIcon />
            </span>
            <NavLabel collapsed={collapsed} className="text-sm">
              {loggingOut ? t('nav.signingOut') : t('nav.signOut')}
            </NavLabel>
          </button>
        </div>
      </aside>
    </>
  )
}
