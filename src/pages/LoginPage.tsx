import { useId, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../lib/apiClient'
import { EMAIL_NOT_VERIFIED, resendVerification } from '../auth/emailVerification'
import { STAGGER_MS } from '../lib/motion'
import { MufflerIcon } from '../components/MufflerLogo'
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined'
import CheckOutlined from '@mui/icons-material/CheckOutlined'
import LockOutlined from '@mui/icons-material/LockOutlined'
import MailOutlined from '@mui/icons-material/MailOutlined'
import PersonOutlined from '@mui/icons-material/PersonOutlined'
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined'

type Mode = 'signin' | 'register' | 'forgot'
type ResendStatus = 'idle' | 'sending' | 'sent'

const PRESSABLE = 'cursor-pointer pressable enabled:hover:shadow-lg enabled:hover:shadow-tag-fg/20'

function stagger(step: number) {
  return { animationDelay: `${step * STAGGER_MS}ms` }
}

function Enter({ step, children }: { step: number; children: ReactNode }) {
  return (
    <div className="animate-enter" style={stagger(step)}>
      {children}
    </div>
  )
}

function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="animate-enter-sm rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
      {children}
    </p>
  )
}

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
      <div className="group flex items-center gap-2.5 rounded-[14px] border border-border-soft bg-surface px-4 py-3.5 transition-[border-color,box-shadow] duration-200 ease-out focus-within:border-tag-fg/50 focus-within:ring-[3px] focus-within:ring-tag-fg/10">
        <span className="flex flex-shrink-0 text-text-secondary transition-[color,transform] duration-200 ease-out group-focus-within:scale-110 group-focus-within:text-tag-fg">
          {icon}
        </span>
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

function MailIcon() {
  return <MailOutlined sx={{ fontSize: 17 }} />
}

function LockIcon() {
  return <LockOutlined sx={{ fontSize: 17 }} />
}

function PersonIcon() {
  return <PersonOutlined sx={{ fontSize: 17 }} />
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? <VisibilityOutlined sx={{ fontSize: 17 }} /> : <VisibilityOffOutlined sx={{ fontSize: 17 }} />
}

function CheckIcon() {
  return <CheckOutlined sx={{ fontSize: 13, color: '#14150F' }} />
}

function SpinnerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="animate-spin motion-reduce:hidden">
      <path d="M21 12a9 9 0 1 1-6.2-8.56" />
    </svg>
  )
}

function SubmitButton({
  loading = false,
  label,
  loadingLabel,
  className = 'mt-2.5',
}: {
  loading?: boolean
  label: string
  loadingLabel?: string
  className?: string
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className={`${className} w-full rounded-[14px] bg-tag-fg py-3.5 text-center font-display text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-60 ${PRESSABLE}`}
    >
      <span key={loading ? 'loading' : 'idle'} className="animate-enter-sm inline-flex items-center justify-center gap-2">
        {loading && <SpinnerIcon />}
        {loading ? loadingLabel : label}
      </span>
    </button>
  )
}

function ArrowLeftIcon() {
  return <ArrowBackOutlined sx={{ fontSize: 15 }} />
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
  const [verificationSentTo, setVerificationSentTo] = useState<string | null>(null)
  const [unverified, setUnverified] = useState(false)
  const [resendStatus, setResendStatus] = useState<ResendStatus>('idle')
  const [introPlayed, setIntroPlayed] = useState(false)

  // After the first mode switch, content enters without waiting for the page intro.
  const headingStep = introPlayed ? 0 : 1
  const formStep = (index: number) => (introPlayed ? 1 : 3) + index

  function switchMode(next: Mode) {
    setIntroPlayed(true)
    setMode(next)
    setResetSent(false)
    setError(null)
    setVerificationSentTo(null)
    setUnverified(false)
    setResendStatus('idle')
  }

  async function handleResend(target: string) {
    setResendStatus('sending')
    try {
      await resendVerification(target)
      setResendStatus('sent')
    } catch (err) {
      setResendStatus('idle')
      setError(err instanceof ApiError ? err.message : t('auth.errors.generic'))
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setUnverified(false)
    setResendStatus('idle')
    setLoading(true)

    try {
      if (mode === 'signin') {
        await login({ email, password }, rememberMe)
        navigate('/resumen')
      } else {
        const registered = await register({ email, password, first_name: firstName, last_name: lastName })
        setVerificationSentTo(registered.email)
        setPassword('')
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === EMAIL_NOT_VERIFIED) {
        setUnverified(true)
        setError(t('auth.verification.notVerified'))
      } else {
        setError(err instanceof ApiError ? err.message : t('auth.errors.generic'))
      }
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
    : verificationSentTo
      ? { title: t('auth.verification.sentTitle'), subtitle: '' }
      : { title: t(`auth.${mode}.title`), subtitle: t(`auth.${mode}.subtitle`) }

  const resendButton = (target: string) =>
    resendStatus === 'sent' ? (
      <p className="text-center text-[13px] text-text-secondary">{t('auth.verification.resent')}</p>
    ) : (
      <button
        type="button"
        disabled={resendStatus === 'sending'}
        onClick={() => handleResend(target)}
        className="cursor-pointer text-center text-[13px] font-bold text-text-primary underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {resendStatus === 'sending' ? t('auth.loading') : t('auth.verification.resend')}
      </button>
    )

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-page p-2.5 md:p-6">
      <div className="flex w-full max-w-[960px] flex-col gap-2.5 rounded-[32px] bg-shell p-2.5 shadow-2xl md:flex-row md:gap-4 md:p-4">
        <div className="relative hidden min-h-[520px] flex-1 flex-col justify-between overflow-hidden px-8 py-9 md:flex">
          <div className="animate-glow pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(215,242,76,0.25),rgba(215,242,76,0)_70%)]" />
          <div
            className="animate-glow pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(201,184,245,0.18),rgba(201,184,245,0)_70%)]"
            style={{ animationDuration: '12s', animationDirection: 'alternate-reverse' }}
          />

          <div className="animate-enter relative flex items-center gap-2.5">
            <MufflerIcon size={34} title="" />
            <span className="font-display text-[17px] font-extrabold text-shell-fg">muffler</span>
          </div>

          <div className="relative">
            <h2 className="animate-enter mb-3.5 font-display text-[28px] font-extrabold leading-[1.25] text-shell-fg" style={stagger(1)}>
              {t('auth.brand.heading')}
            </h2>
            <p className="animate-enter max-w-[340px] text-sm leading-relaxed text-[#B8BAAD]" style={stagger(2)}>
              {t('auth.brand.subheading')}
            </p>
          </div>

          <div className="animate-enter relative text-[11.5px] text-[#6C6E63]" style={stagger(3)}>{t('auth.brand.footer', { year: new Date().getFullYear() })}</div>
        </div>

        <div className="flex flex-1 flex-col justify-center rounded-[26px] bg-main px-6 py-8 sm:px-11 sm:py-12">
          <div className="mx-auto w-full max-w-[360px]">
            <h1
              key={heading.title}
              className="animate-enter mb-1.5 font-display text-[23px] font-extrabold text-text-primary"
              style={stagger(headingStep)}
            >
              {heading.title}
            </h1>
            {heading.subtitle && (
              <p key={heading.subtitle} className="animate-enter mb-7 text-[13.5px] text-text-secondary" style={stagger(headingStep + 1)}>
                {heading.subtitle}
              </p>
            )}

            {mode === 'signin' && !resetSent && (
              <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
                <Enter step={formStep(0)}>
                  <Field
                    label={t('auth.fields.email')}
                    icon={<MailIcon />}
                    type="email"
                    placeholder="ada@muffler.app"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Enter>

                <Enter step={formStep(1)}>
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
                        className="cursor-pointer text-xs font-semibold text-text-secondary underline underline-offset-2"
                      >
                        {t('auth.forgotPassword')}
                      </button>
                    }
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="grid flex-shrink-0 cursor-pointer text-text-secondary"
                        title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                      >
                        <span
                          className={`col-start-1 row-start-1 flex transition-[opacity,transform] duration-200 ease-out ${
                            showPassword ? 'rotate-0 scale-100 opacity-100' : '-rotate-12 scale-75 opacity-0'
                          }`}
                        >
                          <EyeIcon open />
                        </span>
                        <span
                          className={`col-start-1 row-start-1 flex transition-[opacity,transform] duration-200 ease-out ${
                            showPassword ? 'rotate-12 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'
                          }`}
                        >
                          <EyeIcon open={false} />
                        </span>
                      </button>
                    }
                  />
                </Enter>

                <Enter step={formStep(2)}>
                  <div className="mt-0.5 flex items-center gap-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={rememberMe}
                      onClick={() => setRememberMe((v) => !v)}
                      className={`flex h-[18px] w-[18px] flex-shrink-0 cursor-pointer items-center justify-center rounded-[6px] border transition-colors duration-200 ${
                        rememberMe ? 'border-tag-fg bg-tag-fg' : 'border-border-soft bg-surface'
                      }`}
                    >
                      <span
                        className={`flex transition-[opacity,transform] duration-200 ease-out ${
                          rememberMe ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                        }`}
                      >
                        <CheckIcon />
                      </span>
                    </button>
                    <button type="button" onClick={() => setRememberMe((v) => !v)} className="cursor-pointer text-[12.5px] text-text-secondary">
                      {t('auth.staySignedIn')}
                    </button>
                  </div>
                </Enter>

                {error && <ErrorMessage>{error}</ErrorMessage>}
                {unverified && resendButton(email)}

                <Enter step={formStep(3)}>
                  <SubmitButton loading={loading} label={t('auth.signin.cta')} loadingLabel={t('auth.signin.loading')} />
                </Enter>

                <Enter step={formStep(4)}>
                  <p className="mt-2 text-center text-[13px] text-text-secondary">
                    {t('auth.noAccount')}{' '}
                    <button type="button" onClick={() => switchMode('register')} className="cursor-pointer font-bold text-text-primary underline underline-offset-2">
                      {t('auth.registerLink')}
                    </button>
                  </p>
                </Enter>
              </form>
            )}

            {mode === 'register' && verificationSentTo && (
              <div className="animate-enter flex flex-col items-center gap-3.5 py-5 text-center" style={stagger(formStep(0))}>
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-tag-bg text-[#5c8f4e]">
                  <MailIcon />
                </div>
                <p className="max-w-[280px] text-[13px] text-text-secondary">
                  {t('auth.verification.sentMessage', { email: verificationSentTo })}
                </p>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                {resendButton(verificationSentTo)}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className={`mt-1.5 rounded-[14px] bg-tag-fg px-6 py-3 font-display text-[13.5px] font-bold text-black ${PRESSABLE}`}
                >
                  {t('auth.verification.backToSignin')}
                </button>
              </div>
            )}

            {mode === 'register' && !verificationSentTo && (
              <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
                <Enter step={formStep(0)}>
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
                </Enter>

                <Enter step={formStep(1)}>
                  <Field
                    label={t('auth.fields.email')}
                    icon={<MailIcon />}
                    type="email"
                    placeholder="ada@muffler.app"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Enter>

                <Enter step={formStep(2)}>
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
                </Enter>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                <Enter step={formStep(3)}>
                  <SubmitButton loading={loading} label={t('auth.register.cta')} loadingLabel={t('auth.loading')} />
                </Enter>

                <Enter step={formStep(4)}>
                  <p className="mt-2 text-center text-[13px] text-text-secondary">
                    {t('auth.alreadyHave')}{' '}
                    <button type="button" onClick={() => switchMode('signin')} className="cursor-pointer font-bold text-text-primary underline underline-offset-2">
                      {t('auth.signinLink')}
                    </button>
                  </p>
                </Enter>
              </form>
            )}

            {mode === 'forgot' && !resetSent && (
              <form className="flex flex-col gap-3.5" onSubmit={handleForgotSubmit}>
                <Enter step={formStep(0)}>
                  <Field
                    label={t('auth.fields.email')}
                    icon={<MailIcon />}
                    type="email"
                    placeholder="ada@muffler.app"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Enter>

                <Enter step={formStep(1)}>
                  <SubmitButton label={t('auth.forgot.cta')} className="mt-1.5" />
                </Enter>

                <Enter step={formStep(2)}>
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="mt-1 flex w-full cursor-pointer items-center justify-center gap-1.5 text-[13px] text-text-secondary"
                  >
                    <ArrowLeftIcon /> {t('auth.forgot.back')}
                  </button>
                </Enter>
              </form>
            )}

            {mode === 'forgot' && resetSent && (
              <div className="animate-enter flex flex-col items-center gap-3.5 py-5 text-center">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-tag-bg">
                  <CheckOutlined sx={{ fontSize: 26, color: '#5c8f4e' }} />
                </div>
                <p className="max-w-[280px] text-[13px] text-text-secondary">{t('auth.resetSent.message')}</p>
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className={`mt-1.5 rounded-[14px] bg-tag-fg px-6 py-3 font-display text-[13.5px] font-bold text-black ${PRESSABLE}`}
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
