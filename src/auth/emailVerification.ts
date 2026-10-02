import { apiFetch } from '../lib/apiClient'
import type { ResendVerificationRequest, VerifyEmailRequest } from '../lib/types'

/** Mirror the backend error codes for the verification flow. */
export const EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED'
export const VERIFICATION_TOKEN_EXPIRED = 'VERIFICATION_TOKEN_EXPIRED'

export async function verifyEmail(token: string) {
  const body: VerifyEmailRequest = { token }
  await apiFetch('/api/auth/verify-email', { method: 'POST', body })
}

/** The backend answers 202 whether or not the email belongs to a pending account. */
export async function resendVerification(email: string) {
  const body: ResendVerificationRequest = { email }
  await apiFetch('/api/auth/verify-email/resend', { method: 'POST', body })
}
