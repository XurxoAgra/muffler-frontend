import { useId, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../lib/apiClient'

type Mode = 'signin' | 'register' | 'forgot'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: ReactNode
  trailing?: ReactNode
  labelAside?: ReactNode
}

function Field({ label, icon, trailing, labelAside, id, className = '', ...props }: FieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-[7px]">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-[12.5px] font-bold text-text-primary">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="flex items-center gap-2.5 rounded-[14px] border border-border-soft bg-surface px-4 py-3.5">
        <span className="flex-shrink-0 text-text-secondary">{icon}</span>
        <input
          id={inputId}
          className={`w-full min-w-0 border-0 bg-transparent text-[13.5px] text-text-primary outline-none placeholder:text-text-secondary ${className}`}
          {...props}
        />
        {trailing}
      </div>
    </div>
  )
}

function CarIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#14150F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13" />
      <rect x="2" y="13" width="20" height="6" rx="2" />
      <circle cx="7" cy="19" r="1.6" />
      <circle cx="17" cy="19" r="1.6" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7c1.9 0 3.5.5 4.9 1.3M22 12s-1 2-3 3.7M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M1 1l22 22" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14150F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 10.9v3.6h5.1c-.2 1.3-1.6 3.9-5.1 3.9-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6c1.8 0 2.9.7 3.6 1.3l2.5-2.4C16.7 4.7 14.6 3.8 12 3.8 7.2 3.8 3.3 7.7 3.3 12.5S7.2 21.2 12 21.2c4.9 0 7.6-3.4 7.6-8.2 0-.5-.1-1-.2-1.5H12z"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.42 2.15-1.13 2.98-.83.94-2.05 1.63-3.13 1.55-.15-1.11.44-2.28 1.15-3.03.79-.85 2.13-1.5 3.11-1.5zM20.5 17.1c-.53 1.2-.78 1.74-1.46 2.79-.95 1.47-2.29 3.3-3.95 3.31-1.48.02-1.86-.97-3.86-.96-2 .01-2.42.98-3.9.96-1.66-.02-2.93-1.67-3.88-3.14-2.67-4.1-2.95-8.91-1.3-11.47 1.17-1.82 3.02-2.89 4.75-2.89 1.77 0 2.88 1.01 4.35 1.01 1.42 0 2.29-1.01 4.35-1.01 1.55 0 3.19.85 4.36 2.31-3.84 2.1-3.22 7.58.54 9.09z" />
    </svg>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const { t } = useTranslation()

  const [mode, setMode] = useState<Mode>('signin')
  const [resetSent, setResetSent] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function switchMode(next: Mode) {
    setMode(next)
    setResetSent(false)
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
      setError(err instanceof ApiError ? err.message : t('auth.errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  function handleForgotSubmit(event: FormEvent) {
    event.preventDefault()
    setResetSent(true)
  }

  const heading = resetSent
    ? { title: t('auth.resetSent.title'), subtitle: '' }
    : { title: t(`auth.${mode}.title`), subtitle: t(`auth.${mode}.subtitle`) }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-page p-2.5 md:p-6">
      <div className="flex w-full max-w-[960px] flex-col gap-2.5 rounded-[32px] bg-shell p-2.5 shadow-2xl md:flex-row md:gap-4 md:p-4">
        <div className="relative hidden min-h-[520px] flex-1 flex-col justify-between overflow-hidden px-8 py-9 md:flex">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(215,242,76,0.25),rgba(215,242,76,0)_70%)]" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(201,184,245,0.18),rgba(201,184,245,0)_70%)]" />

          <div className="relative flex items-center gap-2.5">
            <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] bg-tag-fg">
              <CarIcon />
            </div>
            <span className="font-display text-[17px] font-extrabold text-shell-fg">muffler</span>
          </div>

          <div className="relative">
            <h2 className="mb-3.5 font-display text-[28px] font-extrabold leading-[1.25] text-shell-fg">
              {t('auth.brand.heading')}
            </h2>
            <p className="max-w-[340px] text-sm leading-relaxed text-[#B8BAAD]">{t('auth.brand.subheading')}</p>

            <div className="mt-7 flex gap-3">
              <div className="flex-1 rounded-2xl bg-white/[0.06] px-4 py-3.5">
                <div className="font-display text-[19px] font-extrabold text-tag-fg">2</div>
                <div className="mt-0.5 text-[11.5px] text-[#B8BAAD]">{t('auth.brand.statVehicles')}</div>
              </div>
              <div className="flex-1 rounded-2xl bg-white/[0.06] px-4 py-3.5">
                <div className="font-display text-[19px] font-extrabold text-tag-fg">100%</div>
                <div className="mt-0.5 text-[11.5px] text-[#B8BAAD]">{t('auth.brand.statUpToDate')}</div>
              </div>
            </div>
          </div>

          <div className="relative text-[11.5px] text-[#6C6E63]">{t('auth.brand.footer', { year: new Date().getFullYear() })}</div>
        </div>

        <div className="flex flex-1 flex-col justify-center rounded-[26px] bg-main px-6 py-8 sm:px-11 sm:py-12">
          <div className="mx-auto w-full max-w-[360px]">
            <h1 className="mb-1.5 font-display text-[23px] font-extrabold text-text-primary">{heading.title}</h1>
            {heading.subtitle && <p className="mb-7 text-[13.5px] text-text-secondary">{heading.subtitle}</p>}

            {mode === 'signin' && !resetSent && (
              <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
                <Field
                  label={t('auth.fields.email')}
                  icon={<MailIcon />}
                  type="email"
                  placeholder="ada@muffler.app"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Field
                  label={t('auth.fields.password')}
                  icon={<LockIcon />}
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  labelAside={
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs font-semibold text-text-secondary underline underline-offset-2"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  }
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="flex-shrink-0 text-text-secondary"
                      title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  }
                />

                <div className="mt-0.5 flex items-center gap-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={rememberMe}
                    onClick={() => setRememberMe((v) => !v)}
                    className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[6px] border transition-colors ${
                      rememberMe ? 'border-tag-fg bg-tag-fg' : 'border-border-soft bg-surface'
                    }`}
                  >
                    {rememberMe && <CheckIcon />}
                  </button>
                  <button type="button" onClick={() => setRememberMe((v) => !v)} className="text-[12.5px] text-text-secondary">
                    {t('auth.staySignedIn')}
                  </button>
                </div>

                {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2.5 rounded-[14px] bg-tag-fg py-3.5 text-center font-display text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? t('auth.loading') : t('auth.signin.cta')}
                </button>

                <div className="my-1.5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border-soft" />
                  <span className="text-[11.5px] text-text-secondary">{t('auth.or')}</span>
                  <div className="h-px flex-1 bg-border-soft" />
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-2 rounded-[14px] border border-border-soft bg-surface py-3 font-display text-[13px] font-semibold text-text-primary transition-opacity hover:opacity-80"
                  >
                    <GoogleIcon /> {t('auth.google')}
                  </button>
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-2 rounded-[14px] border border-border-soft bg-surface py-3 font-display text-[13px] font-semibold text-text-primary transition-opacity hover:opacity-80"
                  >
                    <AppleIcon /> {t('auth.apple')}
                  </button>
                </div>

                <p className="mt-2 text-center text-[13px] text-text-secondary">
                  {t('auth.noAccount')}{' '}
                  <button type="button" onClick={() => switchMode('register')} className="font-bold text-text-primary underline underline-offset-2">
                    {t('auth.registerLink')}
                  </button>
                </p>
              </form>
            )}

            {mode === 'register' && (
              <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3.5">
                  <Field
                    label={t('auth.fields.firstName')}
                    icon={<PersonIcon />}
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <Field
                    label={t('auth.fields.lastName')}
                    icon={<PersonIcon />}
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <Field
                  label={t('auth.fields.email')}
                  icon={<MailIcon />}
                  type="email"
                  placeholder="ada@muffler.app"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Field
                  label={t('auth.fields.password')}
                  icon={<LockIcon />}
                  type="password"
                  placeholder={t('auth.fields.passwordPlaceholder')}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2.5 rounded-[14px] bg-tag-fg py-3.5 text-center font-display text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? t('auth.loading') : t('auth.register.cta')}
                </button>

                <p className="mt-2 text-center text-[13px] text-text-secondary">
                  {t('auth.alreadyHave')}{' '}
                  <button type="button" onClick={() => switchMode('signin')} className="font-bold text-text-primary underline underline-offset-2">
                    {t('auth.signinLink')}
                  </button>
                </p>
              </form>
            )}

            {mode === 'forgot' && !resetSent && (
              <form className="flex flex-col gap-3.5" onSubmit={handleForgotSubmit}>
                <Field
                  label={t('auth.fields.email')}
                  icon={<MailIcon />}
                  type="email"
                  placeholder="ada@muffler.app"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  type="submit"
                  className="mt-1.5 rounded-[14px] bg-tag-fg py-3.5 text-center font-display text-sm font-bold text-black transition-opacity hover:opacity-90"
                >
                  {t('auth.forgot.cta')}
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="mt-1 flex items-center justify-center gap-1.5 text-[13px] text-text-secondary"
                >
                  <ArrowLeftIcon /> {t('auth.forgot.back')}
                </button>
              </form>
            )}

            {mode === 'forgot' && resetSent && (
              <div className="flex flex-col items-center gap-3.5 py-5 text-center">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-tag-bg">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5c8f4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <p className="max-w-[280px] text-[13px] text-text-secondary">{t('auth.resetSent.message')}</p>
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="mt-1.5 rounded-[14px] bg-tag-fg px-6 py-3 font-display text-[13.5px] font-bold text-black transition-opacity hover:opacity-90"
                >
                  {t('auth.resetSent.cta')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
