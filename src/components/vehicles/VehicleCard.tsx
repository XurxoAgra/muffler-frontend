import { useTranslation } from 'react-i18next'
import { getVehicleLabel } from '../../lib/fleetInsights'
import { formatMileage } from '../maintenance/formatters'
import type { Vehicle } from '../../lib/types'
import DirectionsCarOutlined from '@mui/icons-material/DirectionsCarOutlined'

interface VehicleCardProps {
  vehicle: Vehicle
  tint: string
  mileage: number | null
  onOpen: (vehicle: Vehicle) => void
}

export function VehicleCard({ vehicle, tint, mileage, onOpen }: VehicleCardProps) {
  const { t } = useTranslation()

  return (
    <div
      onClick={() => onOpen(vehicle)}
      className="flex cursor-pointer flex-col rounded-[20px] bg-surface p-5 shadow-sm pressable hover:shadow-md"
    >
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px]" style={{ background: tint }}>
          <CarIcon />
        </div>
        <span className="rounded-lg bg-surface-muted px-2.5 py-1.5 font-mono text-[11.5px] font-extrabold tracking-widest text-text-secondary">
          {vehicle.plate}
        </span>
      </div>

      <div className="font-display text-base font-extrabold text-text-primary">{getVehicleLabel(vehicle)}</div>
      <div className="mt-0.5 text-[12.5px] text-text-secondary">
        {vehicle.year} · {formatMileage(mileage)}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onOpen(vehicle)
        }}
        className="mt-4 w-full rounded-lg border border-border-soft py-2 text-xs font-semibold text-text-secondary transition-colors hover:border-lime hover:text-lime"
      >
        {t('vehicle.detail.viewMore')}
      </button>
    </div>
  )
}

function CarIcon() {
  return <DirectionsCarOutlined sx={{ fontSize: 23, color: '#14150F' }} />
}
