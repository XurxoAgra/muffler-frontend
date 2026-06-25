import { useState, type FormEvent } from 'react'
import { Modal } from '../ui/Modal'
import { UnderlineInput } from '../ui/UnderlineInput'
import { ButtonPrimary } from '../ui/ButtonPrimary'
import { ButtonGlass } from '../ui/ButtonGlass'
import { apiFetch, ApiError } from '../../lib/apiClient'
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
  const [serviceDate, setServiceDate] = useState(record?.serviceDate ?? '')
  const [type, setType] = useState(record?.type ?? '')
  const [mileage, setMileage] = useState(record?.mileage != null ? String(record.mileage) : '')
  const [cost, setCost] = useState(record?.cost ?? '')
  const [shopName, setShopName] = useState(record?.shopName ?? '')
  const [nextServiceDate, setNextServiceDate] = useState(record?.nextServiceDate ?? '')
  const [notes, setNotes] = useState(record?.notes ?? '')

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validate(): Partial<Record<string, string>> {
    const errors: Partial<Record<string, string>> = {}
    if (!serviceDate) errors.serviceDate = 'La fecha de servicio es requerida.'
    if (!type.trim()) errors.type = 'El tipo es requerido.'
    if (mileage.trim()) {
      const n = Number(mileage)
      if (!Number.isInteger(n) || n < 0) {
        errors.mileage = 'Debe ser un número entero positivo.'
      }
    }
    if (cost.trim() && !COST_PATTERN.test(cost.trim())) {
      errors.cost = 'Formato incorrecto (ej: 120.50).'
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
      type: type.trim(),
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
        setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el registro.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'create' ? 'Añadir registro.' : 'Editar registro.'

  return (
    <Modal onClose={onClose} className="max-h-[90svh] overflow-y-auto">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
        <UnderlineInput
          label="Fecha de servicio"
          type="date"
          value={serviceDate}
          onChange={(e) => setServiceDate(e.target.value)}
          error={fieldErrors.serviceDate}
          required
        />
        <UnderlineInput
          label="Tipo"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Ej: Cambio de aceite, Revisión ITV…"
          error={fieldErrors.type}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <UnderlineInput
            label="Km"
            type="number"
            min={0}
            step={1}
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            placeholder="Ej: 45000"
            error={fieldErrors.mileage}
          />
          <UnderlineInput
            label="Coste"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="Ej: 120.50"
            error={fieldErrors.cost}
          />
        </div>
        <UnderlineInput
          label="Taller"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          placeholder="Ej: Taller Pepe"
          maxLength={255}
          error={fieldErrors.shopName}
        />
        <UnderlineInput
          label="Próxima revisión"
          type="date"
          value={nextServiceDate}
          onChange={(e) => setNextServiceDate(e.target.value)}
          error={fieldErrors.nextServiceDate}
        />
        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs uppercase tracking-widest text-muted">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Observaciones adicionales…"
            className="w-full resize-none border-0 border-b border-white/12 bg-transparent py-2 text-white outline-none transition-colors placeholder:text-muted focus:border-lime"
          />
          {fieldErrors.notes && <p className="text-xs text-red-400">{fieldErrors.notes}</p>}
        </div>

        {formError && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</p>
        )}

        <div className="mt-2 flex gap-3">
          <ButtonGlass type="button" className="flex-1" onClick={onClose}>
            Cancelar
          </ButtonGlass>
          <ButtonPrimary type="submit" className="flex-1" disabled={submitting}>
            {submitting ? 'Guardando…' : mode === 'create' ? 'Añadir registro' : 'Guardar cambios'}
          </ButtonPrimary>
        </div>
      </form>
    </Modal>
  )
}
