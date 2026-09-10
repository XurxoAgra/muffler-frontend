import { useId, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { UnderlineInput } from '../ui/UnderlineInput'
import { ButtonPrimary } from '../ui/ButtonPrimary'
import { ButtonGlass } from '../ui/ButtonGlass'
import { apiFetch, ApiError } from '../../lib/apiClient'
import { useMaintenanceRecordTypes } from '../../maintenance/useMaintenanceRecordTypes'
import type { MaintenanceRecord, MaintenanceRecordInput } from '../../lib/types'

const COST_PATTERN = /^\d+(\.\d{1,2})?$/

interface MaintenanceFormDrawerProps {
  vehicleId: string
  mode: 'create' | 'edit'
  record?: MaintenanceRecord
  onClose: () => void
  onSaved: () => void
}

export function MaintenanceFormDrawer({
  vehicleId,
  mode,
  record,
  onClose,
  onSaved,
}: MaintenanceFormDrawerProps) {
  const { t, i18n } = useTranslation()
  const { activeTypes, byId, error: typesError } = useMaintenanceRecordTypes()
  const typeSelectId = useId()

  const [serviceDate, setServiceDate] = useState(record?.serviceDate ?? '')
  const [maintenanceRecordTypeId, setMaintenanceRecordTypeId] = useState(record?.maintenanceRecordTypeId ?? '')
  const [mileage, setMileage] = useState(record?.mileage != null ? String(record.mileage) : '')
  const [cost, setCost] = useState(record?.cost ?? '')
  const [shopName, setShopName] = useState(record?.shopName ?? '')
  const [nextServiceDate, setNextServiceDate] = useState(record?.nextServiceDate ?? '')
  const [notes, setNotes] = useState(record?.notes ?? '')

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // A record created before a type was deactivated must keep showing (and keep) that type,
  // so the current value is always selectable even when it is no longer active.
  const typeOptions = useMemo(() => {
    const current = record ? byId.get(record.maintenanceRecordTypeId) : undefined
    const options = current && !current.active ? [...activeTypes, current] : activeTypes
    return options
      .map((option) => ({ id: option.id, label: t(`maintenanceRecordType.${option.key}`) }))
      .sort((a, b) => a.label.localeCompare(b.label, i18n.language))
  }, [activeTypes, byId, record, t, i18n.language])

  function validate(): Partial<Record<string, string>> {
    const errors: Partial<Record<string, string>> = {}
    if (!serviceDate) errors.serviceDate = t('maintenance.validation.serviceDateRequired')
    if (!maintenanceRecordTypeId) errors.maintenanceRecordTypeId = t('maintenance.validation.typeRequired')
    if (mileage.trim()) {
      const n = Number(mileage)
      if (!Number.isInteger(n) || n < 0) {
        errors.mileage = t('maintenance.validation.mileageFormat')
      }
    }
    if (cost.trim() && !COST_PATTERN.test(cost.trim())) {
      errors.cost = t('maintenance.validation.costFormat')
    }
    return errors
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    const body: MaintenanceRecordInput = {
      serviceDate,
      maintenanceRecordTypeId,
      mileage: mileage.trim() ? parseInt(mileage, 10) : null,
      cost: cost.trim() || null,
      shopName: shopName.trim() || null,
      nextServiceDate: nextServiceDate || null,
      notes: notes.trim() || null,
    }

    setSubmitting(true)
    try {
      if (mode === 'create') {
        await apiFetch<MaintenanceRecord>(
          `/api/vehicles/${vehicleId}/maintenance-records`,
          { method: 'POST', body, authenticated: true },
        )
      } else {
        await apiFetch<MaintenanceRecord>(
          `/api/maintenance-records/${record!.id}`,
          { method: 'PUT', body, authenticated: true },
        )
      }
      onSaved()
    } catch (err) {
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR' && err.details) {
        const mapped: Partial<Record<string, string>> = {}
        for (const [field, messages] of Object.entries(err.details)) {
          mapped[field] = Array.isArray(messages) ? String(messages[0]) : String(messages)
        }
        setFieldErrors(mapped)
      } else {
        setFormError(err instanceof ApiError ? err.message : t('maintenance.errors.save'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal onClose={onClose} className="max-h-[90svh] overflow-y-auto">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <h2 className="font-display text-xl font-semibold text-white">
          {mode === 'create' ? t('maintenance.addModal') : t('maintenance.editModal')}
        </h2>
        <UnderlineInput
          label={t('maintenance.fields.serviceDate')}
          type="date"
          value={serviceDate}
          onChange={(e) => setServiceDate(e.target.value)}
          error={fieldErrors.serviceDate}
          required
        />
        <div className="flex flex-col gap-2">
          <label
            htmlFor={typeSelectId}
            className="font-mono text-xs uppercase tracking-widest text-muted"
          >
            {t('maintenance.fields.type')}
          </label>
          <select
            id={typeSelectId}
            value={maintenanceRecordTypeId}
            onChange={(e) => setMaintenanceRecordTypeId(e.target.value)}
            required
            className="w-full border-0 border-b border-white/12 bg-transparent py-2 text-white outline-none transition-colors focus:border-lime"
          >
            <option value="" disabled className="bg-bg">
              {t('maintenance.selectType')}
            </option>
            {typeOptions.map((option) => (
              <option key={option.id} value={option.id} className="bg-bg">
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.maintenanceRecordTypeId && (
            <p className="text-xs text-red-400">{fieldErrors.maintenanceRecordTypeId}</p>
          )}
          {typesError && <p className="text-xs text-red-400">{typesError}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <UnderlineInput
            label={t('maintenance.fields.km')}
            type="number"
            min={0}
            step={1}
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            placeholder={t('maintenance.placeholders.km')}
            error={fieldErrors.mileage}
          />
          <UnderlineInput
            label={t('maintenance.fields.cost')}
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder={t('maintenance.placeholders.cost')}
            error={fieldErrors.cost}
          />
        </div>
        <UnderlineInput
          label={t('maintenance.fields.shop')}
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          placeholder={t('maintenance.placeholders.shop')}
          maxLength={255}
          error={fieldErrors.shopName}
        />
        <UnderlineInput
          label={t('maintenance.fields.nextService')}
          type="date"
          value={nextServiceDate}
          onChange={(e) => setNextServiceDate(e.target.value)}
          error={fieldErrors.nextServiceDate}
        />
        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs uppercase tracking-widest text-muted">
            {t('maintenance.fields.notes')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={t('maintenance.placeholders.notes')}
            className="w-full resize-none border-0 border-b border-white/12 bg-transparent py-2 text-white outline-none transition-colors placeholder:text-muted focus:border-lime"
          />
          {fieldErrors.notes && <p className="text-xs text-red-400">{fieldErrors.notes}</p>}
        </div>

        {formError && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</p>
        )}

        <div className="mt-2 flex gap-3">
          <ButtonGlass type="button" className="flex-1" onClick={onClose}>
            {t('common.cancel')}
          </ButtonGlass>
          <ButtonPrimary type="submit" className="flex-1" disabled={submitting}>
            {submitting
              ? t('maintenance.saving')
              : mode === 'create'
                ? t('maintenance.add')
                : t('maintenance.saveChanges')}
          </ButtonPrimary>
        </div>
      </form>
    </Modal>
  )
}
