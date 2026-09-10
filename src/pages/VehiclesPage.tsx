import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../components/ui/Modal'
import { ButtonGlass } from '../components/ui/ButtonGlass'
import { VehicleCard } from '../components/vehicles/VehicleCard'
import { VehicleFormModal } from '../components/vehicles/VehicleFormModal'
import { VehicleDetailPanel } from '../components/vehicles/VehicleDetailPanel'
import { StatCard } from '../components/dashboard/StatCard'
import { MileageBubbles } from '../components/dashboard/MileageBubbles'
import { MaintenanceIndexDots } from '../components/dashboard/MaintenanceIndexDots'
import { MonthlySpendChart } from '../components/dashboard/MonthlySpendChart'
import { useFleetData } from '../vehicles/FleetDataContext'
import { useMaintenanceRecordTypes } from '../maintenance/useMaintenanceRecordTypes'
import { apiFetch, ApiError } from '../lib/apiClient'
import {
  computeAvgCost,
  computeMaintenanceIndexPct,
  computeMileageBubbles,
  computeMonthlyTotals,
  deriveUpcoming,
  getCurrentMileage,
} from '../lib/fleetInsights'
import { getVehicleTint } from '../constants/vehicleTints'
import { formatCost, formatDate } from '../components/maintenance/formatters'
import type { Vehicle } from '../lib/types'

type ModalState = { mode: 'create' } | { mode: 'edit'; vehicle: Vehicle } | { mode: 'delete'; vehicle: Vehicle } | null

export function VehiclesPage() {
  const { t } = useTranslation()
  const { vehicles, recordsByVehicle, loading, error, refetch } = useFleetData()
  const { labelOf } = useMaintenanceRecordTypes()

  const [modal, setModal] = useState<ModalState>(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const upcoming = useMemo(() => (vehicles ? deriveUpcoming(vehicles, recordsByVehicle) : []), [vehicles, recordsByVehicle])
  const mileageBubbles = useMemo(() => (vehicles ? computeMileageBubbles(vehicles, recordsByVehicle) : []), [vehicles, recordsByVehicle])
  const monthlyTotals = useMemo(() => computeMonthlyTotals(recordsByVehicle), [recordsByVehicle])
  const { avg: avgCost, count: reviewCount } = useMemo(() => computeAvgCost(recordsByVehicle), [recordsByVehicle])
  const maintIndexPct = useMemo(() => (vehicles ? computeMaintenanceIndexPct(vehicles, upcoming) : 100), [vehicles, upcoming])
  const nextReview = useMemo(() => upcoming.find((u) => u.status !== 'vencida') ?? upcoming[0] ?? null, [upcoming])

  const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId) ?? null
  const selectedIndex = vehicles?.findIndex((v) => v.id === selectedVehicleId) ?? -1

  async function handleSaved() {
    await refetch()
    setModal(null)
  }

  async function handleDelete(vehicle: Vehicle) {
    setDeleting(true)
    setDeleteError(null)
    try {
      await apiFetch(`/api/vehicles/${vehicle.id}`, { method: 'DELETE', authenticated: true })
      await refetch()
      setModal(null)
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : t('vehicle.errors.delete'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-[26px]">
            {t('vehicle.page.title')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{t('vehicle.page.subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={() => setModal({ mode: 'create' })}
          className="inline-flex items-center gap-2 rounded-2xl bg-lime px-5 py-2.5 font-display text-sm font-bold text-black transition-opacity hover:opacity-90"
        >
          <PlusIcon /> {t('vehicle.add')}
        </button>
      </div>

      {loading && <p className="text-sm text-text-secondary">{t('common.loading')}</p>}
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {!loading && !error && vehicles && vehicles.length === 0 && (
        <div className="rounded-[22px] bg-surface shadow-sm">
          <EmptyState onAdd={() => setModal({ mode: 'create' })} />
        </div>
      )}

      {!loading && !error && vehicles && vehicles.length > 0 && (
        <>
          <div className="mb-3.5 font-display text-[15.5px] font-extrabold text-text-primary">{t('vehicle.yourVehicles')}</div>
          <div className="mb-6 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {vehicles.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                tint={getVehicleTint(index)}
                mileage={getCurrentMileage(recordsByVehicle[vehicle.id] ?? [])}
                onOpen={(v) => setSelectedVehicleId(v.id)}
                onEdit={(v) => setModal({ mode: 'edit', vehicle: v })}
                onDelete={(v) => setModal({ mode: 'delete', vehicle: v })}
              />
            ))}
          </div>

          <div className="mb-4 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            {mileageBubbles.length > 0 && <MileageBubbles bubbles={mileageBubbles} />}
            <div className="flex flex-col gap-4">
              <StatCard
                icon={<CalendarIcon />}
                title={t('vehicle.stats.nextReview')}
                value={nextReview ? formatDate(nextReview.date) : '—'}
                aside={
                  nextReview && (
                    <div className="max-w-[110px] text-right text-[11.5px] text-text-secondary">
                      {labelOf(nextReview.maintenanceRecordTypeId) ?? '—'}
                      <br />
                      {nextReview.vehicleLabel}
                    </div>
                  )
                }
              />
              <StatCard
                icon={<WrenchIcon />}
                title={t('vehicle.stats.avgCost')}
                value={formatCost(String(avgCost))}
                aside={
                  <span className="rounded-lg bg-tag-bg px-2.5 py-1 text-[11px] font-extrabold text-tag-fg">
                    {t('vehicle.stats.reviewCount', { count: reviewCount })}
                  </span>
                }
              />
            </div>
          </div>

          <div className="mb-4">
            <MaintenanceIndexDots pct={maintIndexPct} />
          </div>

          <MonthlySpendChart totals={monthlyTotals} />
        </>
      )}

      {modal?.mode === 'create' && <VehicleFormModal mode="create" onClose={() => setModal(null)} onSaved={handleSaved} />}

      {modal?.mode === 'edit' && (
        <VehicleFormModal mode="edit" vehicle={modal.vehicle} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}

      {modal?.mode === 'delete' && (
        <Modal onClose={() => setModal(null)}>
          <p className="text-sm text-white">{t('vehicle.deleteConfirm', { plate: modal.vehicle.plate })}</p>
          {deleteError && <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{deleteError}</p>}
          <div className="mt-6 flex gap-3">
            <ButtonGlass type="button" className="flex-1" onClick={() => setModal(null)}>
              {t('common.cancel')}
            </ButtonGlass>
            <button
              type="button"
              disabled={deleting}
              onClick={() => handleDelete(modal.vehicle)}
              className="flex-1 rounded-full bg-danger px-6 py-3 font-display font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? t('vehicle.deleting') : t('common.delete')}
            </button>
          </div>
        </Modal>
      )}

      {selectedVehicle && (
        <VehicleDetailPanel
          vehicle={selectedVehicle}
          records={recordsByVehicle[selectedVehicle.id] ?? []}
          currentMileage={getCurrentMileage(recordsByVehicle[selectedVehicle.id] ?? [])}
          tint={getVehicleTint(selectedIndex)}
          onClose={() => setSelectedVehicleId(null)}
        />
      )}
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  )
}

function WrenchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6z" />
    </svg>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center gap-5 px-10 py-16 text-center">
      <svg width="110" height="110" viewBox="0 0 120 120" fill="none" className="text-lime">
        <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="1" opacity="0.14" />
        <circle cx="60" cy="60" r="44" stroke="currentColor" strokeWidth="1" opacity="0.2" />
        <circle cx="60" cy="60" r="32" stroke="currentColor" strokeWidth="1.4" opacity="0.3" />
        <circle cx="60" cy="60" r="20" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
        <path
          d="M44 66 L48 54 Q53 45 60 44 Q67 45 72 54 L76 66 Z"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.65"
          strokeLinejoin="round"
        />
        <circle cx="49" cy="66" r="5" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.2" opacity="0.65" />
        <circle cx="71" cy="66" r="5" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.2" opacity="0.65" />
      </svg>

      <div>
        <h3 className="font-display text-lg font-bold text-text-primary">{t('vehicle.empty.title')}</h3>
        <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-text-secondary">{t('vehicle.empty.description')}</p>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 font-display text-sm font-semibold text-black transition-opacity hover:opacity-90"
      >
        <PlusIcon /> {t('vehicle.add')}
      </button>
    </div>
  )
}
