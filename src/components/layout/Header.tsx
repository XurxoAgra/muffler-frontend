import { useTranslation } from 'react-i18next'
import { useTheme } from '../../theme/ThemeContext'
import { useProfile } from '../../profile/ProfileContext'
import { useFleetData } from '../../vehicles/FleetDataContext'
import { deriveUpcoming, countOverdue } from '../../lib/fleetInsights'
import { LanguageSwitcher } from '../LanguageSwitcher'

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
    </svg>
  )
}

export function Header() {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { profile } = useProfile()
  const { vehicles, recordsByVehicle } = useFleetData()

  const overdueCount = vehicles ? countOverdue(deriveUpcoming(vehicles, recordsByVehicle)) : 0

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : t('common.loading')
  const initials = profile ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase() : '··'

  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime to-[#8FBE82] font-display text-sm font-bold text-black">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-bold text-text-primary">{fullName}</div>
          <div className="truncate text-xs text-text-secondary">{profile?.email}</div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2.5 sm:max-w-[420px]">
        <div className="hidden flex-1 items-center gap-2.5 rounded-2xl bg-surface px-4 py-2.5 shadow-sm sm:flex">
          <span className="text-text-secondary">
            <SearchIcon />
          </span>
          <span className="text-sm text-text-secondary">{t('dashboard.search')}</span>
        </div>

        <div className="relative flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[13px] bg-surface text-text-primary shadow-sm">
          <BellIcon />
          {overdueCount > 0 && (
            <div className="absolute -right-[3px] -top-[3px] flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9.5px] font-bold text-white">
              {overdueCount}
            </div>
          )}
        </div>

        <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[13px] bg-surface shadow-sm">
          <LanguageSwitcher collapsed />
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? t('nav.switchToLight') : t('nav.switchToDark')}
          className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[13px] bg-surface text-text-primary shadow-sm transition-opacity hover:opacity-80"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </div>
  )
}
