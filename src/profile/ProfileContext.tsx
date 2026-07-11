import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch, ApiError } from '../lib/apiClient'
import type { UserProfile } from '../lib/types'

interface ProfileContextValue {
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    apiFetch<UserProfile>('/api/auth/me', { authenticated: true })
      .then((data) => {
        if (!cancelled) setProfile(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : t('profile.errors.load'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [t])

  return <ProfileContext.Provider value={{ profile, loading, error }}>{children}</ProfileContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook are colocated by convention in this codebase
export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider')
  return ctx
}
