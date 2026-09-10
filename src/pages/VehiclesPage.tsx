import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { VehicleCard } from '../components/vehicles/VehicleCard'
import { VehicleFormModal } from '../components/vehicles/VehicleFormModal'
import { useFleetData } from '../vehicles/FleetDataContext'
import { getCurrentMileage } from '../lib/fleetInsights'
import { getVehicleTint } from '../constants/vehicleTints'

export function VehiclesPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { vehicles, recordsByVehicle, loading, error, refetch } = useFleetData()

  const [creating, setCreating] = useState(false)

  async function handleSaved() {
    await refetch()
    setCreating(false)
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
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-lime px-5 py-2.5 font-display text-sm font-bold text-black transition-opacity hover:opacity-90"
        >
          <PlusIcon /> {t('vehicle.add')}
        </button>
      </div>

      {loading && <p className="text-sm text-text-secondary">{t('common.loading')}</p>}
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {!loading && !error && vehicles && vehicles.length === 0 && (
        <div className="rounded-[22px] bg-surface shadow-sm">
          <EmptyState onAdd={() => setCreating(true)} />
        </div>
      )}

      {!loading && !error && vehicles && vehicles.length > 0 && (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {vehicles.map((vehicle, index) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              tint={getVehicleTint(index)}
              mileage={getCurrentMileage(recordsByVehicle[vehicle.id] ?? [])}
              onOpen={(v) => navigate(`/vehicles/${v.id}`)}
            />
          ))}
        </div>
      )}

      {creating && <VehicleFormModal mode="create" onClose={() => setCreating(false)} onSaved={handleSaved} />}
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
