import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { VehicleCard } from '../components/vehicles/VehicleCard'
import { VehicleFormModal } from '../components/vehicles/VehicleFormModal'
import { Presence } from '../components/ui/Presence'
import { PageSkeleton } from '../components/ui/Skeleton'
import { useFleetData } from '../vehicles/FleetDataContext'
import { getCurrentMileage } from '../lib/fleetInsights'
import { getVehicleTint } from '../constants/vehicleTints'
import AddOutlined from '@mui/icons-material/AddOutlined'
import DirectionsCarOutlined from '@mui/icons-material/DirectionsCarOutlined'

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
          className="inline-flex items-center gap-2 rounded-2xl bg-lime px-5 py-2.5 font-display text-sm font-bold text-black pressable"
        >
          <PlusIcon /> {t('vehicle.add')}
        </button>
      </div>

      {loading && <PageSkeleton variant="cards" />}
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {!loading && !error && vehicles && vehicles.length === 0 && (
        <div className="rounded-[22px] bg-surface shadow-sm">
          <EmptyState onAdd={() => setCreating(true)} />
        </div>
      )}

      {!loading && !error && vehicles && vehicles.length > 0 && (
        <div className="stagger grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
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

      <Presence>{creating && <VehicleFormModal mode="create" onClose={() => setCreating(false)} onSaved={handleSaved} />}</Presence>
    </div>
  )
}

function PlusIcon() {
  return <AddOutlined sx={{ fontSize: 14 }} />
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center gap-5 px-10 py-16 text-center">
      <DirectionsCarOutlined className="text-lime" sx={{ fontSize: 72 }} />

      <div>
        <h3 className="font-display text-lg font-bold text-text-primary">{t('vehicle.empty.title')}</h3>
        <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-text-secondary">{t('vehicle.empty.description')}</p>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 font-display text-sm font-semibold text-black pressable"
      >
        <PlusIcon /> {t('vehicle.add')}
      </button>
    </div>
  )
}
