import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlassPanel } from '../components/ui/GlassPanel'
import { UnderlineInput } from '../components/ui/UnderlineInput'
import { ButtonGlass } from '../components/ui/ButtonGlass'
import { LabelMono } from '../components/ui/LabelMono'
import { SignalMark } from '../components/SignalMark'
import { useAuth } from '../auth/AuthContext'
import { apiFetch, ApiError } from '../lib/apiClient'
import type { UserProfile } from '../lib/types'

export function ProfilePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let cancelled = false

    apiFetch<UserProfile>('/api/auth/me', { authenticated: true })
      .then((data) => {
        if (!cancelled) setProfile(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'No se pudo cargar el perfil.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-bg px-4 py-12">
      <GlassPanel className="w-full max-w-md p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-lime">
            <SignalMark />
            <span className="font-display text-lg font-semibold text-white">muffler</span>
          </div>
          <LabelMono>V0.1</LabelMono>
        </div>

        <h1 className="font-display text-3xl font-semibold text-white">Your profile.</h1>
        <p className="mt-2 text-sm text-white/70">Signal details for your account.</p>

        {loading && <p className="mt-8 text-sm text-white/70">Loading…</p>}

        {error && <p className="mt-8 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

        {profile && (
          <div className="mt-8 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <UnderlineInput label="First name" value={profile.first_name} readOnly disabled />
              <UnderlineInput label="Last name" value={profile.last_name} readOnly disabled />
            </div>
            <UnderlineInput label="Email" value={profile.email} readOnly disabled />
            <UnderlineInput label="Role" value={profile.roles.join(', ')} readOnly disabled />
            <UnderlineInput
              label="Member since"
              value={new Date(profile.created_at).toLocaleDateString()}
              readOnly
              disabled
            />
          </div>
        )}

        <ButtonGlass type="button" className="mt-8 w-full" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </ButtonGlass>
      </GlassPanel>

      <div className="mt-6 flex w-full max-w-md items-center justify-between">
        <LabelMono>Signal · Damped · 38dB</LabelMono>
        <LabelMono>muffler.app/profile</LabelMono>
      </div>
    </div>
  )
}
