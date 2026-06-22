import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../ui/Modal'
import { PillTabs } from '../ui/PillTabs'
import { UnderlineInput } from '../ui/UnderlineInput'
import { ButtonPrimary } from '../ui/ButtonPrimary'
import { ButtonGlass } from '../ui/ButtonGlass'
import { apiFetch, ApiError } from '../../lib/apiClient'
import type { Vehicle, VehicleCatalogRef, VehicleInput } from '../../lib/types'

type CatalogTab = 'catalog' | 'custom'

interface VehicleFormModalProps {
  mode: 'create' | 'edit'
  vehicle?: Vehicle
  onClose: () => void
  onSaved: () => void
}

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i

export function VehicleFormModal({ mode, vehicle, onClose, onSaved }: VehicleFormModalProps) {
  const [plate, setPlate] = useState(vehicle?.plate ?? '')
  const [year, setYear] = useState(vehicle ? String(vehicle.year) : '')
  const [type, setType] = useState(vehicle?.type ?? 'car')
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
      .catch(() => setFormError('Could not load vehicle makes.'))
  }, [])

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
        if (!cancelled) setFormError('Could not load vehicle models.')
      })
    return () => {
      cancelled = true
    }
  }, [tab, makeId])

  function validate(): Partial<Record<string, string>> {
    const errors: Partial<Record<string, string>> = {}
    if (!plate.trim()) errors.plate = 'Plate is required.'
    if (!year.trim()) errors.year = 'Year is required.'
    if (!type.trim()) errors.type = 'Type is required.'
    if (vin.trim() && !VIN_PATTERN.test(vin.trim())) errors.vin = '17 characters, no I, O or Q.'
    if (tab === 'catalog' && !makeId) errors.makeId = 'Select a make.'
    if (tab === 'custom' && !customMake.trim()) errors.customMake = 'Make is required.'
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
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR' && err.details) {
        const mapped: Partial<Record<string, string>> = {}
        for (const [field, messages] of Object.entries(err.details)) {
          mapped[field] = Array.isArray(messages) ? String(messages[0]) : String(messages)
        }
        setFieldErrors(mapped)
      } else {
        setFormError(err instanceof ApiError ? err.message : 'Could not save the vehicle.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="font-display text-xl font-semibold text-white">
        {mode === 'create' ? 'Add vehicle.' : 'Edit vehicle.'}
      </h2>

      <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit}>
        <UnderlineInput label="Plate" value={plate} onChange={(e) => setPlate(e.target.value)} error={fieldErrors.plate} required />

        <div className="grid grid-cols-2 gap-4">
          <UnderlineInput
            label="Year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            error={fieldErrors.year}
            required
          />
          <UnderlineInput label="Type" value={type} onChange={(e) => setType(e.target.value)} error={fieldErrors.type} required />
        </div>

        <UnderlineInput
          label="VIN"
          placeholder="17 characters"
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          error={fieldErrors.vin}
        />

        <PillTabs
          value={tab}
          onChange={setTab}
          options={[
            { value: 'catalog', label: 'From catalog' },
            { value: 'custom', label: 'Custom' },
          ]}
        />

        {tab === 'catalog' ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs uppercase tracking-widest text-muted">Make</label>
              <select
                value={makeId}
                onChange={(e) => {
                  setMakeId(e.target.value)
                  setModelId('')
                  setModels([])
                }}
                className="w-full border-0 border-b border-white/12 bg-transparent py-2 text-white outline-none focus:border-lime"
              >
                <option value="" className="bg-bg">
                  Select make
                </option>
                {makes.map((make) => (
                  <option key={make.id} value={make.id} className="bg-bg">
                    {make.name}
                  </option>
                ))}
              </select>
              {fieldErrors.makeId && <p className="text-xs text-red-400">{fieldErrors.makeId}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs uppercase tracking-widest text-muted">Model</label>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                disabled={!makeId}
                className="w-full border-0 border-b border-white/12 bg-transparent py-2 text-white outline-none focus:border-lime disabled:opacity-50"
              >
                <option value="" className="bg-bg">
                  Select model
                </option>
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
              label="Make"
              value={customMake}
              onChange={(e) => setCustomMake(e.target.value)}
              error={fieldErrors.customMake}
              required
            />
            <UnderlineInput label="Model" value={customModel} onChange={(e) => setCustomModel(e.target.value)} />
          </div>
        )}

        {formError && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</p>}

        <div className="mt-2 flex gap-3">
          <ButtonGlass type="button" className="flex-1" onClick={onClose}>
            Cancel
          </ButtonGlass>
          <ButtonPrimary type="submit" className="flex-1" disabled={submitting}>
            {submitting ? 'Saving…' : mode === 'create' ? 'Add vehicle' : 'Save changes'}
          </ButtonPrimary>
        </div>
      </form>
    </Modal>
  )
}
