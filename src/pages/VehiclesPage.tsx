import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/ui/Sidebar'
import { GlassPanel } from '../components/ui/GlassPanel'
import { Modal } from '../components/ui/Modal'
import { ButtonGlass } from '../components/ui/ButtonGlass'
import { VehicleCard } from '../components/vehicles/VehicleCard'
import { VehicleFormModal } from '../components/vehicles/VehicleFormModal'
import { useAuth } from '../auth/AuthContext'
import { apiFetch, ApiError } from '../lib/apiClient'
import type { UserProfile, Vehicle } from '../lib/types'

type ModalState = { mode: 'create' } | { mode: 'edit'; vehicle: Vehicle } | { mode: 'delete'; vehicle: Vehicle } | null

export function VehiclesPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
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

  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<Vehicle[]>('/api/vehicles', { authenticated: true })
      setVehicles(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your vehicles.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(fetchVehicles)
  }, [fetchVehicles])

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
    navigate('/login')
  }

  async function handleSaved() {
    await fetchVehicles()
    setModal(null)
  }

  async function handleDelete(vehicle: Vehicle) {
    setDeleting(true)
    setDeleteError(null)
    try {
      await apiFetch(`/api/vehicles/${vehicle.id}`, { method: 'DELETE', authenticated: true })
      setVehicles((prev) => prev?.filter((v) => v.id !== vehicle.id) ?? prev)
      setModal(null)
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Could not delete the vehicle.')
    } finally {
      setDeleting(false)
    }
  }

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : 'Loading…'
  const initials = profile ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase() : '··'
  const primaryRole = profile?.roles[0] ?? 'Member'

  return (
    <div className="flex min-h-svh flex-col bg-bg md:flex-row">
      <Sidebar initials={initials} name={fullName} role={primaryRole} onLogout={handleLogout} loggingOut={loggingOut} />

      <main className="flex-1 px-4 py-7 sm:px-8 sm:py-9 md:px-[52px] md:pb-[52px] md:pt-[44px]">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 md:mb-7">
          <div>
            <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
              Account <span className="text-subtle">·</span> Vehicles
            </div>
            <h1 className="font-display text-2xl font-medium leading-tight tracking-tight text-white sm:text-[30px]">
              My vehicles.
            </h1>
            <p className="mt-1.5 text-sm text-muted">Manage your registered vehicles.</p>
          </div>

          <button
            type="button"
            onClick={() => setModal({ mode: 'create' })}
            className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 font-display text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            <PlusIcon /> Add vehicle
          </button>
        </div>

        {loading && <p className="text-sm text-muted">Loading…</p>}
        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        {!loading && !error && vehicles && vehicles.length === 0 && (
          <GlassPanel rounded="rounded-2xl">
            <EmptyState onAdd={() => setModal({ mode: 'create' })} />
          </GlassPanel>
        )}

        {!loading && !error && vehicles && vehicles.length > 0 && (
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}>
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onEdit={(v) => setModal({ mode: 'edit', vehicle: v })}
                onDelete={(v) => setModal({ mode: 'delete', vehicle: v })}
              />
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-1 font-mono text-[9px] tracking-[0.16em] text-subtle sm:mt-7 sm:flex-row sm:justify-between">
          <span>MUFFLER · v0.1 · BETA</span>
          <span>EXHAUST SYS · MUFFLER VEHICLES</span>
        </div>
      </main>

      {modal?.mode === 'create' && <VehicleFormModal mode="create" onClose={() => setModal(null)} onSaved={handleSaved} />}

      {modal?.mode === 'edit' && (
        <VehicleFormModal mode="edit" vehicle={modal.vehicle} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}

      {modal?.mode === 'delete' && (
        <Modal onClose={() => setModal(null)}>
          <p className="text-sm text-white">Delete {modal.vehicle.plate}? This can't be undone.</p>
          {deleteError && <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{deleteError}</p>}
          <div className="mt-6 flex gap-3">
            <ButtonGlass type="button" className="flex-1" onClick={() => setModal(null)}>
              Cancel
            </ButtonGlass>
            <button
              type="button"
              disabled={deleting}
              onClick={() => handleDelete(modal.vehicle)}
              className="flex-1 rounded-full bg-danger px-6 py-3 font-display font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
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

function EmptyState({ onAdd }: { onAdd: () => void }) {
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
        <h3 className="font-display text-lg font-medium text-white">No vehicles yet.</h3>
        <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-muted">
          Add your first vehicle to keep its details in one place.
        </p>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 font-display text-sm font-semibold text-black transition-opacity hover:opacity-90"
      >
        <PlusIcon /> Add vehicle
      </button>
    </div>
  )
}
