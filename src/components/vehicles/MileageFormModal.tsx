import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { UnderlineInput } from '../ui/UnderlineInput'
import { ButtonPrimary } from '../ui/ButtonPrimary'
import { ButtonGlass } from '../ui/ButtonGlass'
import { formatMileage } from '../maintenance/formatters'
import { ApiError } from '../../lib/apiClient'
import type { MileageRecord, MileageRecordInput } from '../../lib/types'

interface MileageFormModalProps {
  /** Newest known snapshot, used only for the non-blocking "lower than last" warning. */
  lastRecord: MileageRecord | null
  onSubmit: (input: MileageRecordInput) => Promise<unknown>
  onClose: () => void
  onSaved: () => void
}

/**
 * The backend validates recordedAt against DATE_ATOM, so a bare `YYYY-MM-DD` from the date
 * input is rejected. Send midnight UTC with an explicit offset, or omit the field entirely
 * and let the backend stamp "now".
 */
function toAtom(date: string): string {
  return `${date}T00:00:00+00:00`
}

export function MileageFormModal({ lastRecord, onSubmit, onClose, onSaved }: MileageFormModalProps) {
  const { t } = useTranslation()

  const [mileage, setMileage] = useState('')
  const [recordedAt, setRecordedAt] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const parsed = mileage.trim() ? Number(mileage) : null
  // Advisory only: whether a lower reading is actually allowed is a domain rule the backend
  // owns (MileageRegressionException), so the client never blocks on it.
  const belowLast =
    parsed !== null && Number.isInteger(parsed) && parsed >= 0 && lastRecord !== null && parsed < lastRecord.mileage

  function validate(): Partial<Record<string, string>> {
    const errors: Partial<Record<string, string>> = {}
    if (!mileage.trim()) {
      errors.mileage = t('vehicle.mileageValidation.required')
    } else if (!Number.isInteger(Number(mileage))) {
      errors.mileage = t('vehicle.mileageValidation.integer')
    } else if (Number(mileage) < 0) {
      errors.mileage = t('vehicle.mileageValidation.negative')
    }
    return errors
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    const body: MileageRecordInput = { mileage: parseInt(mileage, 10) }
    if (recordedAt) body.recordedAt = toAtom(recordedAt)

    setSubmitting(true)
    try {
      await onSubmit(body)
      onSaved()
    } catch (err) {
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR' && err.details) {
        const mapped: Partial<Record<string, string>> = {}
        for (const [field, messages] of Object.entries(err.details)) {
          mapped[field] = Array.isArray(messages) ? String(messages[0]) : String(messages)
        }
        setFieldErrors(mapped)
      } else {
        setFormError(err instanceof ApiError ? err.message : t('vehicle.errors.saveMileage'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <h2 className="font-display text-xl font-semibold text-white">{t('vehicle.mileageHistory.addModal')}</h2>

        <UnderlineInput
          label={t('vehicle.mileageHistory.mileage')}
          type="number"
          min={0}
          step={1}
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
          placeholder={t('maintenance.placeholders.km')}
          error={fieldErrors.mileage}
          required
        />

        {belowLast && lastRecord && (
          <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
            {t('vehicle.mileageValidation.belowLastWarning', { last: formatMileage(lastRecord.mileage) })}
          </p>
        )}

        <UnderlineInput
          label={t('vehicle.mileageHistory.recordedAtOptional')}
          type="date"
          value={recordedAt}
          onChange={(e) => setRecordedAt(e.target.value)}
          error={fieldErrors.recordedAt}
        />

        {formError && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</p>}

        <div className="mt-2 flex gap-3">
          <ButtonGlass type="button" className="flex-1" onClick={onClose}>
            {t('common.cancel')}
          </ButtonGlass>
          <ButtonPrimary type="submit" className="flex-1" disabled={submitting}>
            {submitting ? t('vehicle.saving') : t('vehicle.mileageHistory.add')}
          </ButtonPrimary>
        </div>
      </form>
    </Modal>
  )
}
