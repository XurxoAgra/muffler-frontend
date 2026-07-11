import { useTranslation } from 'react-i18next'
import { RoleBadge } from '../ui/RoleBadge'
import type { Vehicle } from '../../lib/types'

interface VehicleCardProps {
  vehicle: Vehicle
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
}

export function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  const { t } = useTranslation()

  const makeModel =
    vehicle.make && vehicle.model
      ? `${vehicle.make.name} ${vehicle.model.name}`
      : `${vehicle.custom_make ?? ''} ${vehicle.custom_model ?? ''}`.trim()

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-glass backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <span className="rounded-md border border-lime-20 bg-lime-10 px-2.5 py-1 font-mono text-xs font-bold tracking-widest text-lime">
          {vehicle.plate}
        </span>
        <span className="font-mono text-[10px] tracking-widest text-muted">{vehicle.year}</span>
      </div>

      <div className="flex flex-1 flex-col items-center gap-3 px-5 py-6">
        <p className="text-center text-base font-semibold text-white">{makeModel}</p>
        <RoleBadge role={vehicle.role} />
      </div>

      <div className="flex gap-2 border-t border-white/10 px-5 py-4">
        <button
          type="button"
          onClick={() => onEdit(vehicle)}
          className="flex-1 rounded-lg border border-white/12 py-2 text-xs font-medium text-muted transition-colors hover:border-lime hover:text-lime"
        >
          {t('vehicle.editBtn')}
        </button>
        {vehicle.role === 'owner' && (
          <button
            type="button"
            onClick={() => onDelete(vehicle)}
            className="flex-1 rounded-lg border border-white/12 py-2 text-xs text-white font-medium transition-colors bg-danger hover:border-danger hover:text-danger"
          >
            {t('vehicle.deleteBtn')}
          </button>
        )}
      </div>
    </div>
  )
}
