import { useTranslation } from 'react-i18next'
import { getVehicleLabel } from '../../lib/fleetInsights'
import { formatMileage } from '../maintenance/formatters'
import type { Vehicle } from '../../lib/types'

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
      className="flex cursor-pointer flex-col rounded-[20px] bg-surface p-5 shadow-sm transition-transform hover:-translate-y-0.5"
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
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#14150F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13" />
      <rect x="2" y="13" width="20" height="6" rx="2" />
      <circle cx="7" cy="19" r="1.6" />
      <circle cx="17" cy="19" r="1.6" />
    </svg>
  )
}
