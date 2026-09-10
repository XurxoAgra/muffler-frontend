import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Modal } from '../components/ui/Modal'
import { ButtonGlass } from '../components/ui/ButtonGlass'
import { LabelMono } from '../components/ui/LabelMono'
import { MaintenanceTable, type SortKey } from '../components/maintenance/MaintenanceTable'
import { MaintenanceRecordCard } from '../components/maintenance/MaintenanceRecordCard'
import { MaintenanceFormDrawer } from '../components/maintenance/MaintenanceFormDrawer'
import { VehicleFormModal } from '../components/vehicles/VehicleFormModal'
import { ReviewStatusBadge } from '../components/vehicles/ReviewStatusBadge'
import { useFleetData } from '../vehicles/FleetDataContext'
import { useMaintenanceRecordTypes } from '../maintenance/useMaintenanceRecordTypes'
import { apiFetch, ApiError } from '../lib/apiClient'
import {
  deriveReviewStatus,
  deriveUpcoming,
  getCurrentMileage,
  getVehicleLabel,
  getVehicleTotal,
} from '../lib/fleetInsights'
import { getVehicleTint } from '../constants/vehicleTints'
import { formatCost, formatDate, formatMileage } from '../components/maintenance/formatters'
import type { MaintenanceRecord } from '../lib/types'

type DrawerState = { mode: 'create' } | { mode: 'edit'; record: MaintenanceRecord } | null

/** Reviews with a legal deadline, shown as traffic-light badges in the header. */
const LEGAL_REVIEW_KEYS = ['itv', 'insurance'] as const

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const { vehicles, recordsByVehicle, loading, error, refetch } = useFleetData()
  const { byId, labelOf } = useMaintenanceRecordTypes()

  const [typeFilter, setTypeFilter] = useState('')
  const [editingVehicle, setEditingVehicle] = useState(false)
  const [confirmVehicleDelete, setConfirmVehicleDelete] = useState(false)
  const [deletingVehicle, setDeletingVehicle] = useState(false)
  const [vehicleDeleteError, setVehicleDeleteError] = useState<string | null>(null)
  const [drawerState, setDrawerState] = useState<DrawerState>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<MaintenanceRecord | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('serviceDate')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const vehicle = vehicles?.find((v) => v.id === id) ?? null
  const vehicleIndex = vehicles?.findIndex((v) => v.id === id) ?? -1
  const records = useMemo(() => (id ? recordsByVehicle[id] ?? [] : []), [id, recordsByVehicle])

  const totalSpent = useMemo(() => getVehicleTotal(records), [records])
  const mileage = useMemo(() => getCurrentMileage(records), [records])
  const nextReview = useMemo(
    () => (vehicle ? deriveUpcoming([vehicle], { [vehicle.id]: records })[0] ?? null : null),
    [vehicle, records],
  )

  // ITV / insurance state is not a vehicle field: it is derived from the latest record of
  // that catalog type and the next service date it declares.
  const legalReviews = useMemo(() => {
    const today = new Date()
    return LEGAL_REVIEW_KEYS.map((key) => {
      const matching = records.filter((r) => byId.get(r.maintenanceRecordTypeId)?.key === key)
      const latest = matching.length
        ? matching.reduce((a, b) => (new Date(a.serviceDate) > new Date(b.serviceDate) ? a : b))
        : null
      const date = latest?.nextServiceDate ?? null
      return { key, date, status: date ? deriveReviewStatus(date, today) : null }
    })
  }, [records, byId])

  // Only types this vehicle actually has records for, so the filter never offers an empty result.
  const filterOptions = useMemo(() => {
    const present = new Map<string, string>()
    for (const r of records) {
      const type = byId.get(r.maintenanceRecordTypeId)
      if (type) present.set(type.id, t(`maintenanceRecordType.${type.key}`))
    }
    return [...present.entries()]
      .map(([typeId, label]) => ({ id: typeId, label }))
      .sort((a, b) => a.label.localeCompare(b.label, language))
  }, [records, byId, t, language])

  const activeFilter = filterOptions.some((option) => option.id === typeFilter) ? typeFilter : ''

  const visibleRecords = useMemo(() => {
    const filtered = activeFilter ? records.filter((r) => r.maintenanceRecordTypeId === activeFilter) : records
    // The TIPO column sorts by the translated label, not by the catalog id.
    const value = (record: MaintenanceRecord): string | number =>
      sortKey === 'maintenanceRecordType' ? labelOf(record.maintenanceRecordTypeId) ?? '' : record[sortKey] ?? ''

    return [...filtered].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      const aVal = value(a)
      const bVal = value(b)
      if (aVal < bVal) return -dir
      if (aVal > bVal) return dir
      return 0
    })
  }, [records, activeFilter, sortKey, sortDir, labelOf])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  async function handleSaved() {
    setDrawerState(null)
    setEditingVehicle(false)
    await refetch()
  }

  async function handleDeleteVehicle() {
    if (!vehicle) return
    setDeletingVehicle(true)
    setVehicleDeleteError(null)
    try {
      await apiFetch(`/api/vehicles/${vehicle.id}`, { method: 'DELETE', authenticated: true })
      await refetch()
      navigate('/vehicles')
    } catch (err) {
      setVehicleDeleteError(err instanceof ApiError ? err.message : t('vehicle.errors.delete'))
    } finally {
      setDeletingVehicle(false)
    }
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
      <Link
        to="/vehicles"
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-text-secondary transition-colors hover:text-lime"
      >
        <BackIcon /> {t('vehicle.detail.back')}
      </Link>

      {loading && <p className="text-sm text-text-secondary">{t('common.loading')}</p>}
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {!loading && !error && !vehicle && (
        <p className="rounded-[20px] bg-surface px-5 py-8 text-center text-sm text-text-secondary shadow-sm">
          {t('vehicle.detail.notFound')}
        </p>
      )}

      {!loading && !error && vehicle && (
        <>
          <div className="mb-5 flex flex-col gap-4 rounded-[20px] bg-surface p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-start">
              <div
                className="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-[18px]"
                style={{ background: getVehicleTint(vehicleIndex) }}
              >
                <CarIcon />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-text-primary">
                    {getVehicleLabel(vehicle)}
                  </h1>
                  <span className="rounded-lg bg-surface-muted px-2.5 py-1.5 font-mono text-[11.5px] font-extrabold tracking-widest text-text-secondary">
                    {vehicle.plate}
                  </span>
                </div>

                <div className="mt-1 font-mono text-[12.5px] text-text-secondary">
                  {vehicle.year} · {formatMileage(mileage)}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {legalReviews.map((review) => (
                    <ReviewStatusBadge
                      key={review.key}
                      label={t(`maintenanceRecordType.${review.key}`)}
                      status={review.status}
                      date={review.date}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEditingVehicle(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border-soft px-5 py-2.5 font-display text-sm font-bold text-text-secondary transition-colors hover:border-lime hover:text-lime"
              >
                {t('vehicle.editBtn')}
              </button>
              {/* Same rule as the old vehicle card: only an owner may delete a vehicle. */}
              {vehicle.role === 'owner' && (
                <button
                  type="button"
                  onClick={() => setConfirmVehicleDelete(true)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-danger px-5 py-2.5 font-display text-sm font-bold text-white transition-opacity hover:opacity-90"
                >
                  {t('vehicle.deleteBtn')}
                </button>
              )}
            </div>
          </div>

          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[20px] bg-surface p-5 shadow-sm">
              <LabelMono>{t('vehicle.detail.totalSpent')}</LabelMono>
              <div className="mt-1.5 font-display text-xl font-extrabold text-text-primary">
                {formatCost(String(totalSpent))}
              </div>
            </div>

            <div className="rounded-[20px] bg-surface p-5 shadow-sm">
              <LabelMono>{t('vehicle.detail.nextReview')}</LabelMono>
              <div className="mt-1.5 font-display text-xl font-extrabold text-text-primary">
                {nextReview ? formatDate(nextReview.date) : '—'}
              </div>
              {nextReview && (
                <div className="mt-2">
                  <ReviewStatusBadge
                    label={labelOf(nextReview.maintenanceRecordTypeId) ?? '—'}
                    status={nextReview.status}
                    date={null}
                  />
                </div>
              )}
            </div>

            <div className="rounded-[20px] bg-surface p-5 shadow-sm">
              <LabelMono>{t('vehicle.detail.recordCount')}</LabelMono>
              <div className="mt-1.5 font-display text-xl font-extrabold text-text-primary">{records.length}</div>
            </div>
          </div>

          <div className="rounded-[20px] bg-surface p-5 shadow-sm">
            <div className="mb-3.5 flex flex-wrap items-center gap-3">
              <div className="font-display text-[14.5px] font-extrabold text-text-primary">
                {t('vehicle.detail.reviewHistory')}
              </div>

              <div className="ml-auto flex flex-wrap items-center gap-3">
                <div className="text-[11.5px] text-text-secondary">
                  {t('maintenance.stats.total')}:{' '}
                  <span className="font-mono font-extrabold text-text-primary">{formatCost(String(totalSpent))}</span>
                </div>

                {filterOptions.length > 1 && (
                  <select
                    aria-label={t('vehicle.detail.filterLabel')}
                    value={activeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-lg border border-border-soft bg-surface-muted px-3 py-1.5 text-xs text-text-primary outline-none transition-colors focus:border-lime"
                  >
                    <option value="" className="bg-surface">
                      {t('vehicle.detail.allTypes')}
                    </option>
                    {filterOptions.map((option) => (
                      <option key={option.id} value={option.id} className="bg-surface">
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  onClick={() => setDrawerState({ mode: 'create' })}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-lime px-3 py-1.5 font-display text-xs font-bold text-black transition-opacity hover:opacity-90"
                >
                  <PlusIcon /> {t('maintenance.add')}
                </button>
              </div>
            </div>

            {records.length === 0 ? (
              <EmptyState onAdd={() => setDrawerState({ mode: 'create' })} />
            ) : visibleRecords.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-secondary">{t('vehicle.detail.noFilterResults')}</p>
            ) : (
              <>
                <div className="hidden md:block">
                  <MaintenanceTable
                    records={visibleRecords}
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    onEdit={(record) => setDrawerState({ mode: 'edit', record })}
                    onDelete={(record) => setDeleteConfirm(record)}
                  />
                </div>
                <div className="flex flex-col gap-3 md:hidden">
                  {visibleRecords.map((record) => (
                    <MaintenanceRecordCard
                      key={record.id}
                      record={record}
                      onEdit={(rec) => setDrawerState({ mode: 'edit', record: rec })}
                      onDelete={(rec) => setDeleteConfirm(rec)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {editingVehicle && (
            <VehicleFormModal
              mode="edit"
              vehicle={vehicle}
              onClose={() => setEditingVehicle(false)}
              onSaved={handleSaved}
            />
          )}

          {drawerState?.mode === 'create' && (
            <MaintenanceFormDrawer
              vehicleId={vehicle.id}
              mode="create"
              onClose={() => setDrawerState(null)}
              onSaved={handleSaved}
            />
          )}
          {drawerState?.mode === 'edit' && (
            <MaintenanceFormDrawer
              vehicleId={vehicle.id}
              mode="edit"
              record={drawerState.record}
              onClose={() => setDrawerState(null)}
              onSaved={handleSaved}
            />
          )}

          {confirmVehicleDelete && (
            <Modal
              onClose={() => {
                setConfirmVehicleDelete(false)
                setVehicleDeleteError(null)
              }}
            >
              <p className="text-sm text-white">{t('vehicle.deleteConfirm', { plate: vehicle.plate })}</p>
              {vehicleDeleteError && (
                <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{vehicleDeleteError}</p>
              )}
              <div className="mt-6 flex gap-3">
                <ButtonGlass
                  type="button"
                  className="flex-1"
                  onClick={() => {
                    setConfirmVehicleDelete(false)
                    setVehicleDeleteError(null)
                  }}
                >
                  {t('common.cancel')}
                </ButtonGlass>
                <button
                  type="button"
                  disabled={deletingVehicle}
                  onClick={handleDeleteVehicle}
                  className="flex-1 rounded-full bg-danger px-6 py-3 font-display font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingVehicle ? t('vehicle.deleting') : t('common.delete')}
                </button>
              </div>
            </Modal>
          )}

          {deleteConfirm && (
            <Modal
              onClose={() => {
                setDeleteConfirm(null)
                setDeleteError(null)
              }}
            >
              <p className="text-sm text-white">
                {t('maintenance.deleteConfirm', {
                  type: labelOf(deleteConfirm.maintenanceRecordTypeId) ?? '—',
                  date: formatDate(deleteConfirm.serviceDate),
                })}
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
        </>
      )}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
      <svg width="72" height="72" viewBox="0 0 24 24" fill="none" className="text-lime" strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="11" opacity="0.2" />
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6z" opacity="0.7" />
      </svg>
      <div>
        <h3 className="font-display text-base font-bold text-text-primary">{t('maintenance.empty.title')}</h3>
        <p className="mt-1.5 max-w-[280px] text-sm leading-relaxed text-text-secondary">
          {t('maintenance.empty.description')}
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 font-display text-sm font-semibold text-black transition-opacity hover:opacity-90"
      >
        <PlusIcon /> {t('maintenance.addFirst')}
      </button>
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
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
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#14150F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13" />
      <rect x="2" y="13" width="20" height="6" rx="2" />
      <circle cx="7" cy="19" r="1.6" />
      <circle cx="17" cy="19" r="1.6" />
    </svg>
  )
}
