import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sidebar } from '../components/ui/Sidebar'
import { GlassPanel } from '../components/ui/GlassPanel'
import { Modal } from '../components/ui/Modal'
import { ButtonGlass } from '../components/ui/ButtonGlass'
import { MaintenanceTable, type SortKey } from '../components/maintenance/MaintenanceTable'
import { MaintenanceRecordCard } from '../components/maintenance/MaintenanceRecordCard'
import { MaintenanceFormDrawer } from '../components/maintenance/MaintenanceFormDrawer'
import { useAuth } from '../auth/AuthContext'
import { apiFetch, ApiError } from '../lib/apiClient'
import type { UserProfile, Vehicle, MaintenanceRecord } from '../lib/types'

type DrawerState =
  | { mode: 'create' }
  | { mode: 'edit'; record: MaintenanceRecord }
  | null

export function MantenimientoPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { t, i18n } = useTranslation()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null)
  const [records, setRecords] = useState<MaintenanceRecord[] | null>(null)
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [recordsError, setRecordsError] = useState<string | null>(null)

  const [sortKey, setSortKey] = useState<SortKey>('serviceDate')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const [drawerState, setDrawerState] = useState<DrawerState>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<MaintenanceRecord | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    apiFetch<UserProfile>('/api/auth/me', { authenticated: true }).then((data) => {
      if (!cancelled) setProfile(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    apiFetch<Vehicle[]>('/api/vehicles', { authenticated: true }).then((data) => {
      if (cancelled) return
      setVehicles(data)
      if (!vehicleId && data.length > 0) {
        navigate(`/mantenimiento/${data[0].id}`, { replace: true })
      }
    })
    return () => {
      cancelled = true
    }
  }, [vehicleId, navigate])

  const fetchRecords = useCallback(async (id: string) => {
    setLoadingRecords(true)
    setRecordsError(null)
    try {
      const data = await apiFetch<MaintenanceRecord[]>(
        `/api/vehicles/${id}/maintenance-records`,
        { authenticated: true },
      )
      setRecords(data)
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setRecordsError(t('maintenance.errors.forbidden'))
      } else if (err instanceof ApiError && err.status === 404) {
        setRecordsError(t('maintenance.errors.notFound'))
      } else {
        setRecordsError(err instanceof ApiError ? err.message : t('maintenance.errors.load'))
      }
    } finally {
      setLoadingRecords(false)
    }
  }, [t])

  useEffect(() => {
    if (!vehicleId) return
    setRecords(null)
    setSortKey('serviceDate')
    setSortDir('desc')
    void fetchRecords(vehicleId)
  }, [vehicleId, fetchRecords])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortedRecords = useMemo(() => {
    if (!records) return []
    return [...records].sort((a, b) => {
      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''
      const dir = sortDir === 'asc' ? 1 : -1
      if (aVal < bVal) return -dir
      if (aVal > bVal) return dir
      return 0
    })
  }, [records, sortKey, sortDir])

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
    navigate('/login')
  }

  async function handleSaved() {
    setDrawerState(null)
    if (vehicleId) await fetchRecords(vehicleId)
  }

  async function handleDelete(record: MaintenanceRecord) {
    setDeleting(true)
    setDeleteError(null)
    try {
      await apiFetch(`/api/maintenance-records/${record.id}`, {
        method: 'DELETE',
        authenticated: true,
      })
      setRecords((prev) => prev?.filter((r) => r.id !== record.id) ?? prev)
      setDeleteConfirm(null)
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : t('maintenance.errors.delete'),
      )
    } finally {
      setDeleting(false)
    }
  }

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : t('common.loading')
  const initials = profile
    ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase()
    : '··'
  const primaryRole = profile?.roles[0] ?? t('profile.defaultRole')

  const dateLang = i18n.language === 'en' ? 'en-GB' : 'es-ES'

  return (
    <div className="flex min-h-svh flex-col bg-bg md:flex-row">
      <Sidebar
        initials={initials}
        name={fullName}
        role={primaryRole}
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />

      <main className="flex-1 px-4 py-7 sm:px-8 sm:py-9 md:px-[52px] md:pb-[52px] md:pt-[44px]">
        <div className="mb-6 md:mb-7">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
            {t('profile.account')} <span className="text-subtle">·</span> {t('maintenance.page.breadcrumb')}
          </div>
          <h1 className="font-display text-2xl font-medium leading-tight tracking-tight text-white sm:text-[30px]">
            {t('maintenance.page.title')}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {t('maintenance.page.subtitle')}
          </p>
        </div>

        {vehicles && vehicles.length === 0 && (
          <GlassPanel rounded="rounded-2xl">
            <div className="flex flex-col items-center gap-5 px-10 py-16 text-center">
              <h3 className="font-display text-lg font-medium text-white">
                {t('maintenance.noVehicles.title')}
              </h3>
              <p className="max-w-[280px] text-sm leading-relaxed text-muted">
                {t('maintenance.noVehicles.description')}
              </p>
              <button
                type="button"
                onClick={() => navigate('/vehicles')}
                className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 font-display text-sm font-semibold text-black transition-opacity hover:opacity-90"
              >
                {t('maintenance.noVehicles.cta')}
              </button>
            </div>
          </GlassPanel>
        )}

        {vehicles && vehicles.length > 0 && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <select
                value={vehicleId ?? ''}
                onChange={(e) => navigate(`/mantenimiento/${e.target.value}`)}
                className="border-0 border-b border-white/12 bg-transparent py-2 font-display text-sm text-white outline-none focus:border-lime"
              >
                {vehicles.map((v) => {
                  const make = v.custom_make ?? v.make?.name ?? ''
                  const model = v.custom_model ?? v.model?.name ?? ''
                  const label = [v.plate, make && model ? `${make} ${model}` : make || model]
                    .filter(Boolean)
                    .join(' · ')
                  return (
                    <option key={v.id} value={v.id} className="bg-bg">
                      {label}
                    </option>
                  )
                })}
              </select>

              <button
                type="button"
                onClick={() => setDrawerState({ mode: 'create' })}
                className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 font-display text-sm font-semibold text-black transition-opacity hover:opacity-90"
              >
                <PlusIcon /> {t('maintenance.add')}
              </button>
            </div>

            {vehicleId && (
              <>
                {loadingRecords && <p className="text-sm text-muted">{t('common.loading')}</p>}
                {recordsError && (
                  <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                    {recordsError}
                  </p>
                )}
                {!loadingRecords && !recordsError && records && records.length === 0 && (
                  <GlassPanel rounded="rounded-2xl">
                    <EmptyRecordsState onAdd={() => setDrawerState({ mode: 'create' })} />
                  </GlassPanel>
                )}
                {!loadingRecords && !recordsError && sortedRecords.length > 0 && (
                  <>
                    <div className="hidden md:block">
                      <MaintenanceTable
                        records={sortedRecords}
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={handleSort}
                        onEdit={(r) => setDrawerState({ mode: 'edit', record: r })}
                        onDelete={(r) => setDeleteConfirm(r)}
                      />
                    </div>
                    <div className="flex flex-col gap-4 md:hidden">
                      {sortedRecords.map((r) => (
                        <MaintenanceRecordCard
                          key={r.id}
                          record={r}
                          onEdit={(rec) => setDrawerState({ mode: 'edit', record: rec })}
                          onDelete={(rec) => setDeleteConfirm(rec)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>

      {drawerState?.mode === 'create' && vehicleId && (
        <MaintenanceFormDrawer
          vehicleId={vehicleId}
          mode="create"
          onClose={() => setDrawerState(null)}
          onSaved={handleSaved}
        />
      )}
      {drawerState?.mode === 'edit' && vehicleId && (
        <MaintenanceFormDrawer
          vehicleId={vehicleId}
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
            {t('maintenance.deleteConfirm', {
              type: deleteConfirm.type,
              date: new Date(deleteConfirm.serviceDate).toLocaleDateString(dateLang),
            })}
          </p>
          {deleteError && (
            <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {deleteError}
            </p>
          )}
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
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function EmptyRecordsState({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center gap-5 px-10 py-16 text-center">
      <svg width="110" height="110" viewBox="0 0 120 120" fill="none" className="text-lime">
        <path
          d="M51 69 L57 63 C56 59 57 54 60 51 C64 47 70 46 75 48 L69 54 L66 62 L74 65 L80 59 C82 64 81 70 77 74 C74 77 68 78 64 77 L57 84 C55 86 52 86 50 84 C48 82 49 71 51 69Z"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.65"
        />
      </svg>
      <div>
        <h3 className="font-display text-lg font-medium text-white">{t('maintenance.empty.title')}</h3>
        <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-muted">
          {t('maintenance.empty.description')}
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 font-display text-sm font-semibold text-black transition-opacity hover:opacity-90"
      >
        <PlusIcon /> {t('maintenance.addFirst')}
      </button>
    </div>
  )
}
