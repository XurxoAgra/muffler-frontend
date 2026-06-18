import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlassPanel } from '../components/ui/GlassPanel'
import { PillTabs } from '../components/ui/PillTabs'
import { UnderlineInput } from '../components/ui/UnderlineInput'
import { ButtonPrimary } from '../components/ui/ButtonPrimary'
import { ButtonGlass } from '../components/ui/ButtonGlass'
import { LabelMono } from '../components/ui/LabelMono'
import { SignalMark } from '../components/SignalMark'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../lib/apiClient'

type Mode = 'signin' | 'register'

const COPY: Record<Mode, { title: string; subtitle: string; cta: string }> = {
  signin: { title: 'Welcome back.', subtitle: 'Pick up where the silence left off.', cta: 'Sign in →' },
  register: { title: 'Create your account.', subtitle: 'Set up your signal in seconds.', cta: 'Create account →' },
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login, register } = useAuth()

  const [mode, setMode] = useState<Mode>('signin')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const copy = COPY[mode]

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'signin') {
        await login({ email, password }, rememberMe)
      } else {
        await register({ email, password, first_name: firstName, last_name: lastName }, rememberMe)
      }
      navigate('/profile')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-bg px-4 py-12">
      <div className="absolute left-6 top-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`rounded-full px-3 py-1 font-mono text-xs uppercase tracking-widest transition-colors ${
            theme === 'dark' ? 'bg-white text-black' : 'text-white/50'
          }`}
        >
          Dark
        </button>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`rounded-full px-3 py-1 font-mono text-xs uppercase tracking-widest transition-colors ${
            theme === 'light' ? 'bg-white text-black' : 'text-white/50'
          }`}
        >
          Light
        </button>
      </div>

      <GlassPanel className="w-full max-w-md p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-lime">
            <SignalMark />
            <span className="font-display text-lg font-semibold text-white">muffler</span>
          </div>
          <LabelMono>V0.1</LabelMono>
        </div>

        <h1 className="font-display text-3xl font-semibold text-white">{copy.title}</h1>
        <p className="mt-2 text-sm text-white/70">{copy.subtitle}</p>

        <PillTabs
          className="mt-6"
          value={mode}
          onChange={switchMode}
          options={[
            { value: 'signin', label: 'Sign in' },
            { value: 'register', label: 'Register' },
          ]}
        />

        <form className="mt-8 flex flex-col gap-6" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-4">
              <UnderlineInput
                label="First name"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <UnderlineInput
                label="Last name"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          )}

          <UnderlineInput
            label="Email"
            type="email"
            placeholder="ada@muffler.app"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <UnderlineInput
            label="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-white/70">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-transparent accent-lime"
              />
              Stay signed in
            </label>
            {mode === 'signin' && (
              <a href="#" className="text-lime hover:underline">
                Forgot password?
              </a>
            )}
          </div>

          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

          <ButtonPrimary type="submit" disabled={loading}>
            {loading ? 'Please wait…' : copy.cta}
          </ButtonPrimary>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <LabelMono>or</LabelMono>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ButtonGlass type="button">Google</ButtonGlass>
          <ButtonGlass type="button">Apple</ButtonGlass>
        </div>

        <p className="mt-6 text-center text-sm text-white/70">
          {mode === 'signin' ? (
            <>
              Don't have one?{' '}
              <button type="button" onClick={() => switchMode('register')} className="text-white underline">
                Register
              </button>
            </>
          ) : (
            <>
              Already have one?{' '}
              <button type="button" onClick={() => switchMode('signin')} className="text-white underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </GlassPanel>

      <div className="mt-6 flex w-full max-w-md items-center justify-between">
        <LabelMono>Signal · Damped · 38dB</LabelMono>
        <LabelMono>muffler.app/auth</LabelMono>
      </div>
    </div>
  )
}
