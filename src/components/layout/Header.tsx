import { useTranslation } from 'react-i18next'
import { useProfile } from '../../profile/ProfileContext'
import { HeaderActions } from './HeaderActions'

export function Header() {
  const { t } = useTranslation()
  const { profile } = useProfile()

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

      <HeaderActions className="hidden flex-1 justify-end sm:max-w-[420px] lg:flex" />
    </div>
  )
}
