import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { UnderlineInput } from '../ui/UnderlineInput'
import { ButtonPrimary } from '../ui/ButtonPrimary'
import { ButtonGlass } from '../ui/ButtonGlass'
import { ApiError } from '../../lib/apiClient'
import type { VehicleUser } from '../../lib/types'

interface VehicleInviteUserModalProps {
  onSubmit: (email: string) => Promise<VehicleUser>
  onClose: () => void
  onInvited: () => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function VehicleInviteUserModal({ onSubmit, onClose, onInvited }: VehicleInviteUserModalProps) {
  const { t } = useTranslation()

  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validate(): string | null {
    const trimmed = email.trim()
    if (!trimmed) return t('vehicle.users.validation.emailRequired')
    if (!EMAIL_PATTERN.test(trimmed)) return t('vehicle.users.validation.emailInvalid')
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const error = validate()
    setFieldError(error)
    if (error) return

    setSubmitting(true)
    try {
      await onSubmit(email.trim())
      onInvited()
    } catch (err) {
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR' && err.details?.email) {
        const messages = err.details.email
        setFieldError(Array.isArray(messages) ? String(messages[0]) : String(messages))
      } else if (err instanceof ApiError && err.code === 'INVITED_USER_NOT_FOUND') {
        setFormError(t('vehicle.users.errors.userNotFound'))
      } else if (err instanceof ApiError && err.code === 'VEHICLE_USER_ALREADY_EXISTS') {
        setFormError(t('vehicle.users.errors.alreadyHasAccess'))
      } else {
        setFormError(err instanceof ApiError ? err.message : t('vehicle.users.errors.invite'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <h2 className="font-display text-xl font-semibold text-white">{t('vehicle.users.inviteModalTitle')}</h2>

        <UnderlineInput
          label={t('vehicle.users.inviteEmailLabel')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('vehicle.users.inviteEmailPlaceholder')}
          error={fieldError ?? undefined}
          required
        />

        {formError && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</p>}

        <div className="mt-2 flex gap-3">
          <ButtonGlass type="button" className="flex-1" onClick={onClose}>
            {t('common.cancel')}
          </ButtonGlass>
          <ButtonPrimary type="submit" className="flex-1" disabled={submitting}>
            {submitting ? t('vehicle.users.inviting') : t('vehicle.users.inviteSubmit')}
          </ButtonPrimary>
        </div>
      </form>
    </Modal>
  )
}
