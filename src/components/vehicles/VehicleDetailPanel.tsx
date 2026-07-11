import { useTranslation } from 'react-i18next'
import { getVehicleLabel } from '../../lib/fleetInsights'
import { formatDate, formatCost } from '../maintenance/formatters'
import type { MaintenanceRecord, Vehicle } from '../../lib/types'

interface VehicleDetailPanelProps {
  vehicle: Vehicle
  records: MaintenanceRecord[]
  currentMileage: number | null
  tint: string
  onClose: () => void
}

export function VehicleDetailPanel({ vehicle, records, currentMileage, tint, onClose }: VehicleDetailPanelProps) {
  const { t } = useTranslation()
  const sortedRecords = [...records].sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[420px] overflow-y-auto bg-main p-6 sm:p-8">
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-text-primary"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-[18px]" style={{ background: tint }}>
          <CarIcon />
        </div>

        <div className="font-display text-xl font-extrabold text-text-primary">{getVehicleLabel(vehicle)}</div>
        <div className="mt-1 text-sm text-text-secondary">{vehicle.plate}</div>

        <div className="my-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface p-4">
            <div className="text-[11px] font-bold uppercase text-text-secondary">{t('vehicle.fields.year')}</div>
            <div className="mt-1 font-display text-base font-extrabold text-text-primary">{vehicle.year}</div>
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <div className="text-[11px] font-bold uppercase text-text-secondary">{t('vehicle.detail.mileage')}</div>
            <div className="mt-1 font-display text-base font-extrabold text-text-primary">
              {currentMileage !== null ? `${currentMileage.toLocaleString()} km` : '—'}
            </div>
          </div>
        </div>

        <div className="mb-3 font-display text-sm font-bold text-text-primary">{t('vehicle.detail.reviewHistory')}</div>
        <div className="flex flex-col gap-2.5">
          {sortedRecords.length === 0 && <p className="text-sm text-text-secondary">{t('maintenance.empty.title')}</p>}
          {sortedRecords.map((r) => (
            <div key={r.id} className="rounded-[14px] bg-surface p-3.5">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-bold text-text-primary">{r.type}</span>
                <span className="text-[13px] font-extrabold text-success">{formatCost(r.cost)}</span>
              </div>
              <div className="mt-0.5 text-xs text-text-secondary">
                {formatDate(r.serviceDate)} · {r.shopName ?? '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
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
