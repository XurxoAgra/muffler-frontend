import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Modal } from '../components/ui/Modal'
import { ButtonGlass } from '../components/ui/ButtonGlass'
import { MaintenanceTable, type SortKey } from '../components/maintenance/MaintenanceTable'
import { MaintenanceRecordCard } from '../components/maintenance/MaintenanceRecordCard'
import { MaintenanceFormDrawer } from '../components/maintenance/MaintenanceFormDrawer'
import { SpendByVehicleBars } from '../components/dashboard/SpendByVehicleBars'
import { UpcomingReviewsList } from '../components/dashboard/UpcomingReviewsList'
import { useFleetData } from '../vehicles/FleetDataContext'
import { apiFetch, ApiError } from '../lib/apiClient'
import { computeGlobalTotal, computeSpendByVehicle, deriveUpcoming, getVehicleLabel } from '../lib/fleetInsights'
import { getVehicleTint } from '../constants/vehicleTints'
import type { MaintenanceRecord } from '../lib/types'

type DrawerState = { vehicleId: string; mode: 'create' } | { vehicleId: string; mode: 'edit'; record: MaintenanceRecord } | null

export function MantenimientoPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { vehicles, recordsByVehicle, loading, error, refetch } = useFleetData()

  const [drawerState, setDrawerState] = useState<DrawerState>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<MaintenanceRecord | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('serviceDate')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function sortRecords(records: MaintenanceRecord[]): MaintenanceRecord[] {
    return [...records].sort((a, b) => {
      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''
      const dir = sortDir === 'asc' ? 1 : -1
      if (aVal < bVal) return -dir
      if (aVal > bVal) return dir
      return 0
    })
  }

  const upcoming = useMemo(() => (vehicles ? deriveUpcoming(vehicles, recordsByVehicle) : []), [vehicles, recordsByVehicle])
  const spendByVehicle = useMemo(() => (vehicles ? computeSpendByVehicle(vehicles, recordsByVehicle) : []), [vehicles, recordsByVehicle])
  const globalTotal = useMemo(() => computeGlobalTotal(recordsByVehicle), [recordsByVehicle])

  async function handleSaved() {
    setDrawerState(null)
    await refetch()
  }

  async function handleDelete(record: MaintenanceRecord) {
    setDeleting(true)
    setDeleteError(null)
    try {
      await apiFetch(`/api/maintenance-records/${record.id}`, { method: 'DELETE', authenticated: true })
      await refetch()
      setDeleteConfirm(null)
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : t('maintenance.errors.delete'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-[26px]">
        {t('maintenance.page.title')}
      </h1>
      <p className="mb-6 text-sm text-text-secondary">{t('maintenance.page.subtitle')}</p>

      {loading && <p className="text-sm text-text-secondary">{t('common.loading')}</p>}
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {!loading && !error && vehicles && vehicles.length === 0 && (
        <div className="rounded-[22px] bg-surface shadow-sm">
          <div className="flex flex-col items-center gap-5 px-10 py-16 text-center">
            <h3 className="font-display text-lg font-bold text-text-primary">{t('maintenance.noVehicles.title')}</h3>
            <p className="max-w-[280px] text-sm leading-relaxed text-text-secondary">{t('maintenance.noVehicles.description')}</p>
            <button
              type="button"
              onClick={() => navigate('/vehicles')}
              className="inline-flex items-center gap-2 rounded-2xl bg-lime px-6 py-3 font-display text-sm font-bold text-black transition-opacity hover:opacity-90"
            >
              {t('maintenance.noVehicles.cta')}
            </button>
          </div>
        </div>
      )}

      {!loading && !error && vehicles && vehicles.length > 0 && (
        <>
          <div className="mb-5 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <SpendByVehicleBars vehicles={spendByVehicle} globalTotal={globalTotal} />
            {upcoming.length > 0 && <UpcomingReviewsList items={upcoming} />}
          </div>

          <div className="flex flex-col gap-4">
            {vehicles.map((vehicle, index) => {
              const records = recordsByVehicle[vehicle.id] ?? []
              const sortedRecords = sortRecords(records)
              const total = records.reduce((s, r) => s + (r.cost ? parseFloat(r.cost) : 0), 0)

              return (
                <div key={vehicle.id} className="rounded-[20px] bg-surface p-5 shadow-sm">
                  <div className="mb-3.5 flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px]"
                      style={{ background: getVehicleTint(index) }}
                    >
                      <CarIcon />
                    </div>
                    <div className="font-display text-[14.5px] font-extrabold text-text-primary">{getVehicleLabel(vehicle)}</div>
                    <div className="ml-auto flex items-center gap-3">
                      <div className="text-[11.5px] text-text-secondary">
                        {t('maintenance.stats.total')}: <span className="font-extrabold text-text-primary">{total.toFixed(2)} €</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDrawerState({ vehicleId: vehicle.id, mode: 'create' })}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-lime px-3 py-1.5 font-display text-xs font-bold text-black transition-opacity hover:opacity-90"
                      >
                        <PlusIcon /> {t('maintenance.add')}
                      </button>
                    </div>
                  </div>

                  {sortedRecords.length === 0 ? (
                    <p className="py-6 text-center text-sm text-text-secondary">{t('maintenance.empty.title')}</p>
                  ) : (
                    <>
                      <div className="hidden md:block">
                        <MaintenanceTable
                          records={sortedRecords}
                          sortKey={sortKey}
                          sortDir={sortDir}
                          onSort={handleSort}
                          onEdit={(r) => setDrawerState({ vehicleId: vehicle.id, mode: 'edit', record: r })}
                          onDelete={(r) => setDeleteConfirm(r)}
                        />
                      </div>
                      <div className="flex flex-col gap-3 md:hidden">
                        {sortedRecords.map((r) => (
                          <MaintenanceRecordCard
                            key={r.id}
                            record={r}
                            onEdit={(rec) => setDrawerState({ vehicleId: vehicle.id, mode: 'edit', record: rec })}
                            onDelete={(rec) => setDeleteConfirm(rec)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {drawerState?.mode === 'create' && (
        <MaintenanceFormDrawer vehicleId={drawerState.vehicleId} mode="create" onClose={() => setDrawerState(null)} onSaved={handleSaved} />
      )}
      {drawerState?.mode === 'edit' && (
        <MaintenanceFormDrawer
          vehicleId={drawerState.vehicleId}
          mode="edit"
          record={drawerState.record}
          onClose={() => setDrawerState(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteConfirm && (
        <Modal
          onClose={() => {
            setDeleteConfirm(null)
            setDeleteError(null)
          }}
        >
          <p className="text-sm text-white">
            {t('maintenance.deleteConfirm', { type: deleteConfirm.type, date: new Date(deleteConfirm.serviceDate).toLocaleDateString() })}
          </p>
          {deleteError && <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{deleteError}</p>}
          <div className="mt-6 flex gap-3">
            <ButtonGlass
              type="button"
              className="flex-1"
              onClick={() => {
                setDeleteConfirm(null)
                setDeleteError(null)
              }}
            >
              {t('common.cancel')}
            </ButtonGlass>
            <button
              type="button"
              disabled={deleting}
              onClick={() => handleDelete(deleteConfirm)}
              className="flex-1 rounded-full bg-danger px-6 py-3 font-display font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? t('maintenance.deleting') : t('maintenance.deleteBtn')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function CarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14150F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13" />
      <rect x="2" y="13" width="20" height="6" rx="2" />
      <circle cx="7" cy="19" r="1.6" />
      <circle cx="17" cy="19" r="1.6" />
    </svg>
  )
}
