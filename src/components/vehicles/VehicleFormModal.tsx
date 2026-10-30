import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { PillTabs } from '../ui/PillTabs'
import { UnderlineInput } from '../ui/UnderlineInput'
import { ButtonPrimary } from '../ui/ButtonPrimary'
import { ButtonGlass } from '../ui/ButtonGlass'
import { apiFetch, ApiError } from '../../lib/apiClient'
import type { Vehicle, VehicleCatalogRef, VehicleInput } from '../../lib/types'
import { VEHICLE_TYPES, type VehicleTypeValue } from '../../constants/vehicleTypes'

type CatalogTab = 'catalog' | 'custom'

interface VehicleFormModalProps {
  mode: 'create' | 'edit'
  vehicle?: Vehicle
  onClose: () => void
  onSaved: () => void
}

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i

export function VehicleFormModal({ mode, vehicle, onClose, onSaved }: VehicleFormModalProps) {
  const { t } = useTranslation()

  const [plate, setPlate] = useState(vehicle?.plate ?? '')
  const [year, setYear] = useState(vehicle ? String(vehicle.year) : '')
  const [type, setType] = useState<VehicleTypeValue | ''>(
    (vehicle?.type as VehicleTypeValue | undefined) ?? ''
  )
  const [vin, setVin] = useState(vehicle?.vin ?? '')
  const [tab, setTab] = useState<CatalogTab>(vehicle?.custom_make != null ? 'custom' : 'catalog')
  const [makeId, setMakeId] = useState(vehicle?.make?.id ?? '')
  const [modelId, setModelId] = useState(vehicle?.model?.id ?? '')
  const [customMake, setCustomMake] = useState(vehicle?.custom_make ?? '')
  const [customModel, setCustomModel] = useState(vehicle?.custom_model ?? '')

  const [makes, setMakes] = useState<VehicleCatalogRef[]>([])
  const [models, setModels] = useState<VehicleCatalogRef[]>([])
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  /** Adds or clears one field's error, leaving the others untouched. */
  function setFieldError(field: string, message: string | undefined) {
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (message) next[field] = message
      else delete next[field]
      return next
    })
  }

  function vinError(value: string): string | undefined {
    const trimmed = value.trim()
    return trimmed && !VIN_PATTERN.test(trimmed) ? t('vehicle.validation.vinFormat') : undefined
  }

  useEffect(() => {
    apiFetch<VehicleCatalogRef[]>('/api/vehicle-makes', { authenticated: true })
      .then(setMakes)
      .catch(() => setFormError(t('vehicle.errors.loadMakes')))
  }, [t])

  // The make/model catalog only lists cars; any other type (or none yet) goes straight to custom fields.
  const catalogAvailable = type === 'car'
  const activeTab: CatalogTab = catalogAvailable ? tab : 'custom'

  const visibleModels = activeTab === 'catalog' && makeId ? models : []

  useEffect(() => {
    if (activeTab !== 'catalog' || !makeId) {
      return
    }
    let cancelled = false
    apiFetch<VehicleCatalogRef[]>(`/api/vehicle-makes/${makeId}/models`, { authenticated: true })
      .then((data) => {
        if (!cancelled) setModels(data)
      })
      .catch(() => {
        if (!cancelled) setFormError(t('vehicle.errors.loadModels'))
      })
    return () => {
      cancelled = true
    }
  }, [activeTab, makeId, t])

  function validate(): Partial<Record<string, string>> {
    const errors: Partial<Record<string, string>> = {}

    const trimmedPlate = plate.trim()
    if (!trimmedPlate) {
      errors.plate = t('vehicle.validation.plateRequired')
    } else if (trimmedPlate.length < 6) {
      errors.plate = t('vehicle.validation.plateMinLength')
    }

    const trimmedYear = year.trim()
    if (!trimmedYear) {
      errors.year = t('vehicle.validation.yearRequired')
    } else {
      const yearNum = Number(trimmedYear)
      const currentYear = new Date().getFullYear()
      if (yearNum < 1900) {
        errors.year = t('vehicle.validation.yearMin')
      } else if (yearNum > currentYear) {
        errors.year = t('vehicle.validation.yearMax')
      }
    }

    if (!type) errors.type = t('vehicle.validation.typeRequired')
    const vinMessage = vinError(vin)
    if (vinMessage) errors.vin = vinMessage
    if (activeTab === 'catalog' && !makeId) errors.makeId = t('vehicle.validation.makeRequired')
    if (activeTab === 'custom' && !customMake.trim()) errors.customMake = t('vehicle.validation.customMakeRequired')
    return errors
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    const body: VehicleInput = {
      plate: plate.trim(),
      year: Number(year),
      type: type.trim(),
      vin: vin.trim() || null,
      makeId: activeTab === 'catalog' ? makeId : null,
      modelId: activeTab === 'catalog' && modelId ? modelId : null,
      customMake: activeTab === 'custom' ? customMake.trim() : null,
      customModel: activeTab === 'custom' ? customModel.trim() || null : null,
    }

    setSubmitting(true)
    try {
      if (mode === 'create') {
        await apiFetch<Vehicle>('/api/vehicles', { method: 'POST', body, authenticated: true })
      } else {
        await apiFetch<Vehicle>(`/api/vehicles/${vehicle!.id}`, { method: 'PUT', body, authenticated: true })
      }
      onSaved()
    } catch (err) {
      if (err instanceof ApiError && (err.status === 422 || err.code === 'VALIDATION_ERROR') && err.details) {
        const mapped: Partial<Record<string, string>> = {}
        for (const [field, messages] of Object.entries(err.details)) {
          mapped[field] = Array.isArray(messages) ? String(messages[0]) : String(messages)
        }
        setFieldErrors(mapped)
      } else {
        setFormError(err instanceof ApiError ? err.message : t('vehicle.errors.save'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="font-display text-xl font-semibold text-white">
        {mode === 'create' ? t('vehicle.addModal') : t('vehicle.editModal')}
      </h2>

      <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit}>
        <UnderlineInput
          label={t('vehicle.fields.plate')}
          value={plate}
          onChange={(e) => {
            const value = e.target.value
            setPlate(value)
            if (fieldErrors.plate !== undefined) {
              const trimmed = value.trim()
              const err = !trimmed
                ? t('vehicle.validation.plateRequired')
                : trimmed.length < 6
                  ? t('vehicle.validation.plateMinLength')
                  : undefined
              setFieldError('plate', err)
            }
          }}
          error={fieldErrors.plate}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <UnderlineInput
            label={t('vehicle.fields.year')}
            type="number"
            value={year}
            onChange={(e) => {
              const value = e.target.value
              setYear(value)
              if (fieldErrors.year !== undefined) {
                const trimmed = value.trim()
                const yearNum = Number(trimmed)
                const currentYear = new Date().getFullYear()
                const err = !trimmed
                  ? t('vehicle.validation.yearRequired')
                  : yearNum < 1900
                    ? t('vehicle.validation.yearMin')
                    : yearNum > currentYear
                      ? t('vehicle.validation.yearMax')
                      : undefined
                setFieldError('year', err)
              }
            }}
            error={fieldErrors.year}
            required
          />
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs uppercase tracking-widest text-muted">
              {t('vehicle.fields.type')}
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as VehicleTypeValue)
                setFieldError('type', undefined)
              }}
              required
              className="w-full border-0 border-b border-white/12 bg-transparent py-2 text-white outline-none focus:border-lime"
            >
              <option value="" disabled className="bg-bg">{t('vehicle.selectType')}</option>
              {VEHICLE_TYPES.map((vehicleType) => (
                <option key={vehicleType} value={vehicleType} className="bg-bg">
                  {t(`vehicle.type.${vehicleType}`)}
                </option>
              ))}
            </select>
            {fieldErrors.type && <p className="text-xs text-red-400">{fieldErrors.type}</p>}
          </div>
        </div>

        <UnderlineInput
          label={t('vehicle.fields.vin')}
          placeholder={t('vehicle.vinPlaceholder')}
          value={vin}
          onChange={(e) => {
            const value = e.target.value
            setVin(value)
            if (fieldErrors.vin !== undefined) setFieldError('vin', vinError(value))
          }}
          error={fieldErrors.vin}
        />

        {catalogAvailable && (
          <PillTabs
            value={tab}
            onChange={(next) => {
              setTab(next)
              setFieldError('makeId', undefined)
              setFieldError('customMake', undefined)
            }}
            options={[
              { value: 'catalog', label: t('vehicle.tabs.catalog') },
              { value: 'custom', label: t('vehicle.tabs.custom') },
            ]}
          />
        )}

        {activeTab === 'catalog' ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs uppercase tracking-widest text-muted">
                {t('vehicle.fields.make')}
              </label>
              <select
                value={makeId}
                onChange={(e) => {
                  setMakeId(e.target.value)
                  setModelId('')
                  setModels([])
                  setFieldError('makeId', undefined)
                }}
                className="w-full border-0 border-b border-white/12 bg-transparent py-2 text-white outline-none focus:border-lime"
              >
                <option value="" className="bg-bg">{t('vehicle.selectMake')}</option>
                {makes.map((make) => (
                  <option key={make.id} value={make.id} className="bg-bg">
                    {make.name}
                  </option>
                ))}
              </select>
              {fieldErrors.makeId && <p className="text-xs text-red-400">{fieldErrors.makeId}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs uppercase tracking-widest text-muted">
                {t('vehicle.fields.model')}
              </label>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                disabled={!makeId}
                className="w-full border-0 border-b border-white/12 bg-transparent py-2 text-white outline-none focus:border-lime disabled:opacity-50"
              >
                <option value="" className="bg-bg">{t('vehicle.selectModel')}</option>
                {visibleModels.map((model) => (
                  <option key={model.id} value={model.id} className="bg-bg">
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <UnderlineInput
              label={t('vehicle.fields.make')}
              value={customMake}
              onChange={(e) => {
                setCustomMake(e.target.value)
                setFieldError('customMake', undefined)
              }}
              error={fieldErrors.customMake}
              required
            />
            <UnderlineInput
              label={t('vehicle.fields.model')}
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
            />
          </div>
        )}

        {formError && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</p>}

        <div className="mt-2 flex gap-3">
          <ButtonGlass type="button" className="flex-1" onClick={onClose}>
            {t('common.cancel')}
          </ButtonGlass>
          <ButtonPrimary type="submit" className="flex-1" disabled={submitting}>
            {submitting ? t('vehicle.saving') : mode === 'create' ? t('vehicle.add') : t('vehicle.saveChanges')}
          </ButtonPrimary>
        </div>
      </form>
    </Modal>
  )
}
