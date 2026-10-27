import { useTranslation } from 'react-i18next'
import { formatCost } from '../maintenance/formatters'
import type { VehicleSpend } from '../../lib/fleetInsights'

export function SpendByVehicleBars({ vehicles, globalTotal }: { vehicles: VehicleSpend[]; globalTotal: number }) {
  const { t } = useTranslation()

  return (
    <div className="rounded-[20px] bg-surface p-5 shadow-sm">
      <div className="mb-1.5 font-display text-sm font-bold text-text-primary">{t('maintenance.stats.spendByVehicle')}</div>
      <div className="mb-4 text-xs text-text-secondary">
        {t('maintenance.stats.globalTotal')}: <span className="whitespace-nowrap font-bold text-text-primary">{formatCost(String(globalTotal))}</span>
      </div>
      <div className="flex flex-col gap-3.5">
        {vehicles.map((v) => (
          <div key={v.vehicleId}>
            <div className="mb-1.5 flex items-start justify-between gap-3 text-[12.5px] font-bold text-text-primary">
              <span className="min-w-0 break-words">{v.label}</span>
              <span className="flex-shrink-0 whitespace-nowrap">{formatCost(String(v.total))}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-lg bg-surface-muted">
              <div className="h-full rounded-lg" style={{ width: `${v.barPct}%`, background: v.tint }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
