import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary } from '../components/ui/ButtonPrimary'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useAuth } from '../auth/AuthContext'
import LanguageOutlined from '@mui/icons-material/LanguageOutlined'
import LockOutlined from '@mui/icons-material/LockOutlined'
import LogoutOutlined from '@mui/icons-material/LogoutOutlined'
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined'

export function ProfilePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { t } = useTranslation()

  const [notifEnabled, setNotifEnabled] = useState(true)
  const [passwordFormOpen, setPasswordFormOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
    navigate('/login')
  }

  return (
    <div className="max-w-[620px]">
      <h1 className="mb-1 font-display text-2xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-[26px]">
        {t('profile.title')}
      </h1>
      <p className="mb-6 text-sm text-text-secondary">{t('profile.subtitle')}</p>

      <div className="mb-5 rounded-[22px] bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border-soft py-3.5">
          <div className="flex items-center gap-3">
            <BellIcon />
            <span className="text-sm font-semibold text-text-primary">{t('profile.settings.notifications')}</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notifEnabled}
            onClick={() => setNotifEnabled((v) => !v)}
            className={`relative h-[25px] w-[44px] flex-shrink-0 rounded-full transition-colors ${notifEnabled ? 'bg-lime' : 'bg-surface-muted'}`}
          >
            <span
              className={`absolute top-[3px] h-[19px] w-[19px] rounded-full bg-white shadow transition-all ${
                notifEnabled ? 'left-[22px]' : 'left-[3px]'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-border-soft py-3.5">
          <div className="flex items-center gap-3">
            <GlobeIcon />
            <span className="text-sm font-semibold text-text-primary">{t('profile.settings.language')}</span>
          </div>
          <div className="w-16">
            <LanguageSwitcher collapsed />
          </div>
        </div>

        <div className="pt-3.5">
          <button type="button" onClick={() => setPasswordFormOpen((v) => !v)} className="flex items-center gap-3">
            <LockIcon />
            <span className="text-sm font-semibold text-text-primary">{t('profile.settings.changePassword')}</span>
          </button>

          {passwordFormOpen && (
            <div className="mt-3.5 flex flex-col gap-2.5">
              <input
                type="password"
                placeholder={t('profile.settings.newPassword')}
                className="rounded-xl border border-border-soft bg-surface-muted px-4 py-3 text-[13.5px] text-text-primary outline-none placeholder:text-text-secondary"
              />
              <input
                type="password"
                placeholder={t('profile.settings.confirmPassword')}
                className="rounded-xl border border-border-soft bg-surface-muted px-4 py-3 text-[13.5px] text-text-primary outline-none placeholder:text-text-secondary"
              />
              <ButtonPrimary type="button" disabled className="mt-1 w-fit px-6 py-2.5 text-[13.5px]">
                {t('common.save')}
              </ButtonPrimary>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="inline-flex w-fit items-center gap-2.5 rounded-2xl bg-surface px-5 py-3.5 font-display text-[13.5px] font-bold text-danger shadow-sm pressable disabled:cursor-not-allowed disabled:opacity-60"
      >
        <SignOutIcon />
        {loggingOut ? t('nav.signingOut') : t('nav.signOut')}
      </button>
    </div>
  )
}

function BellIcon() {
  return <NotificationsOutlined className="text-text-secondary" sx={{ fontSize: 18 }} />
}

function GlobeIcon() {
  return <LanguageOutlined className="text-text-secondary" sx={{ fontSize: 18 }} />
}

function LockIcon() {
  return <LockOutlined className="text-text-secondary" sx={{ fontSize: 18 }} />
}

function SignOutIcon() {
  return <LogoutOutlined sx={{ fontSize: 18 }} />
}
