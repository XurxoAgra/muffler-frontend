import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../lib/apiClient'
import { VERIFICATION_TOKEN_EXPIRED, resendVerification, verifyEmail } from '../auth/emailVerification'

type Status = 'verifying' | 'success' | 'expired' | 'invalid'

export function VerifyEmailPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'invalid')
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // StrictMode runs effects twice in dev; the endpoint is idempotent, but one request is enough.
  const requested = useRef(false)

  useEffect(() => {
    if (!token || requested.current) return
    requested.current = true

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus(err instanceof ApiError && err.code === VERIFICATION_TOKEN_EXPIRED ? 'expired' : 'invalid')
      })
  }, [token])

  async function handleResend(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setResending(true)
    try {
      await resendVerification(email)
      setResent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('auth.errors.generic'))
    } finally {
      setResending(false)
    }
  }

  const copy: Record<Status, { title: string; message: string }> = {
    verifying: { title: t('auth.verification.verifyingTitle'), message: '' },
    success: { title: t('auth.verification.successTitle'), message: t('auth.verification.successMessage') },
    expired: { title: t('auth.verification.expiredTitle'), message: t('auth.verification.expiredMessage') },
    invalid: { title: t('auth.verification.invalidTitle'), message: t('auth.verification.invalidMessage') },
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-page p-2.5 md:p-6">
      <div className="w-full max-w-[480px] rounded-[32px] bg-shell p-2.5 shadow-2xl md:p-4">
        <div className="flex flex-col items-center gap-3.5 rounded-[26px] bg-main px-6 py-10 text-center sm:px-11">
          <h1 className="font-display text-[23px] font-extrabold text-text-primary">{copy[status].title}</h1>
          {copy[status].message && <p className="max-w-[320px] text-[13.5px] text-text-secondary">{copy[status].message}</p>}

          {status === 'expired' && !resent && (
            <form className="flex w-full max-w-[320px] flex-col gap-3" onSubmit={handleResend}>
              <input
                type="email"
                required
                placeholder="ada@muffler.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-[14px] border border-border-soft bg-surface px-4 py-3.5 text-[13.5px] text-text-primary outline-none placeholder:text-text-secondary"
              />
              {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
              <button
                type="submit"
                disabled={resending}
                className="rounded-[14px] bg-tag-fg py-3.5 font-display text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resending ? t('auth.loading') : t('auth.verification.resend')}
              </button>
            </form>
          )}

          {resent && <p className="text-[13px] text-text-secondary">{t('auth.verification.resent')}</p>}

          {status !== 'verifying' && (
            <Link
              to="/login"
              className="mt-1.5 rounded-[14px] bg-tag-fg px-6 py-3 font-display text-[13.5px] font-bold text-black transition-opacity hover:opacity-90"
            >
              {t('auth.verification.backToSignin')}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
