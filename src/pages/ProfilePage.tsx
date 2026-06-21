import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/ui/Sidebar'
import { GlassPanel } from '../components/ui/GlassPanel'
import { ExhaustAvatar } from '../components/ui/ExhaustAvatar'
import { RoleBadge } from '../components/ui/RoleBadge'
import { ProfileField } from '../components/ui/ProfileField'
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
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load your profile.')
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

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : 'Loading…'
  const initials = profile ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase() : '··'
  const primaryRole = profile?.roles[0] ?? 'Member'
  const memberSince = profile
    ? new Date(profile.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  return (
    <div className="flex min-h-svh bg-bg">
      <Sidebar initials={initials} name={fullName} role={primaryRole} onLogout={handleLogout} loggingOut={loggingOut} />

      <main className="flex-1 px-6 py-10 sm:px-[52px] sm:pb-[52px] sm:pt-[44px]">
        <div className="mb-7">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
            Account <span className="text-subtle">·</span> Profile
          </div>
          <h1 className="font-display text-[30px] font-medium leading-tight tracking-tight text-white">Your profile.</h1>
          <p className="mt-1.5 text-sm text-muted">Personal information and account settings.</p>
        </div>

        {loading && <p className="text-sm text-muted">Loading…</p>}
        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        {profile && (
          <GlassPanel rounded="rounded-2xl" className="overflow-hidden">
            <div
              className="flex flex-wrap items-center gap-6 border-b border-white/10 px-8 py-7"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(135deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(45deg, rgba(255,255,255,0.010) 0px, rgba(255,255,255,0.010) 1px, transparent 1px, transparent 8px)',
              }}
            >
              <ExhaustAvatar size={84} />

              <div className="min-w-[180px] flex-1">
                <h2 className="font-display text-[22px] font-semibold leading-tight tracking-tight text-white">{fullName}</h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                  <RoleBadge role={primaryRole} />
                  <span className="font-mono text-[11px] text-muted">{profile.email}</span>
                </div>
                <div className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-lime-20">
                    <ClockIcon />
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    Member since <span className="text-white">{memberSince}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="px-8">
              <ProfileField label="First name" value={profile.first_name} editable />
              <ProfileField label="Last name" value={profile.last_name} editable />
              <ProfileField label="Email" value={profile.email} editable mono />
              <ProfileField label="Role" badge={<RoleBadge role={primaryRole} />} />
              <ProfileField label="Member since" value={memberSince} mono />
            </div>
          </GlassPanel>
        )}

        <div className="mt-7 flex justify-between font-mono text-[9px] tracking-[0.16em] text-subtle">
          <span>MUFFLER · v0.1 · BETA</span>
          <span>EXHAUST SYS · MUFFLER AUTH</span>
        </div>
      </main>
    </div>
  )
}

function ClockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-lime" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
