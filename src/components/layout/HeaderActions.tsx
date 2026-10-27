import { useTranslation } from 'react-i18next'
import { useTheme } from '../../theme/ThemeContext'
import { useFleetData } from '../../vehicles/FleetDataContext'
import { deriveUpcoming, countOverdue } from '../../lib/fleetInsights'
import { LanguageSwitcher } from '../LanguageSwitcher'
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlined from '@mui/icons-material/LightModeOutlined'
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined'

function BellIcon() {
  return <NotificationsOutlined sx={{ fontSize: 18 }} />
}

function SunIcon() {
  return <LightModeOutlined sx={{ fontSize: 18 }} />
}

function MoonIcon() {
  return <DarkModeOutlined sx={{ fontSize: 17 }} />
}

// Notifications, language and theme. Rendered in the Header from `lg` up and inside the MobileMenu overlay below it.
export function HeaderActions({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { vehicles, recordsByVehicle } = useFleetData()

  const overdueCount = vehicles ? countOverdue(deriveUpcoming(vehicles, recordsByVehicle)) : 0

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
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
        className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[13px] bg-surface text-text-primary shadow-sm pressable"
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  )
}
