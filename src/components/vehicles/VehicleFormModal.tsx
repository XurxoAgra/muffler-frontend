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

  useEffect(() => {
    apiFetch<VehicleCatalogRef[]>('/api/vehicle-makes', { authenticated: true })
      .then(setMakes)
      .catch(() => setFormError(t('vehicle.errors.loadMakes')))
  }, [t])

  const visibleModels = tab === 'catalog' && makeId ? models : []

  useEffect(() => {
    if (tab !== 'catalog' || !makeId) {
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
  }, [tab, makeId, t])

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
    if (vin.trim() && !VIN_PATTERN.test(vin.trim())) errors.vin = t('vehicle.validation.vinFormat')
    if (tab === 'catalog' && !makeId) errors.makeId = t('vehicle.validation.makeRequired')
    if (tab === 'custom' && !customMake.trim()) errors.customMake = t('vehicle.validation.customMakeRequired')
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
      makeId: tab === 'catalog' ? makeId : null,
      modelId: tab === 'catalog' && modelId ? modelId : null,
      customMake: tab === 'custom' ? customMake.trim() : null,
      customModel: tab === 'custom' ? customModel.trim() || null : null,
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
              setFieldErrors((prev) => {
                const next = { ...prev }
                if (err) next.plate = err
                else delete next.plate
                return next
              })
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
                setFieldErrors((prev) => {
                  const next = { ...prev }
                  if (err) next.year = err
                  else delete next.year
                  return next
                })
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
              onChange={(e) => setType(e.target.value as VehicleTypeValue)}
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
          onChange={(e) => setVin(e.target.value)}
          error={fieldErrors.vin}
        />

        <PillTabs
          value={tab}
          onChange={setTab}
          options={[
            { value: 'catalog', label: t('vehicle.tabs.catalog') },
            { value: 'custom', label: t('vehicle.tabs.custom') },
          ]}
        />

        {tab === 'catalog' ? (
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
              onChange={(e) => setCustomMake(e.target.value)}
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
          <ButtonPrimary type="submit" className="flex-1" disabled={submitting || Object.keys(fieldErrors).length > 0}>
            {submitting ? t('vehicle.saving') : mode === 'create' ? t('vehicle.add') : t('vehicle.saveChanges')}
          </ButtonPrimary>
        </div>
      </form>
    </Modal>
  )
}
