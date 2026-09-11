import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MileageHistoryChart } from './MileageHistoryChart'
import type { MaintenanceRecord } from '../../lib/types'

interface MileageHistorySectionProps {
  /** Every maintenance record of the vehicle, unfiltered and in any order. */
  records: MaintenanceRecord[]
}

/**
 * Mileage over time, plotted from the maintenance records this view already loads.
 * Records without a mileage are dropped rather than interpolated: the Y axis is an odometer
 * reading, and inventing one would contradict the "—" the records table shows for them.
 */
export function MileageHistorySection({ records }: MileageHistorySectionProps) {
  const { t } = useTranslation()

  const withMileage = useMemo(
    () => records.filter((r): r is MaintenanceRecord & { mileage: number } => r.mileage !== null),
    [records],
  )

  const skipped = records.length - withMileage.length

  return (
    <div className="rounded-[20px] bg-surface p-5 shadow-sm">
      <div className="mb-3.5 flex flex-wrap items-center gap-3">
        <div className="font-display text-[14.5px] font-extrabold text-text-primary">
          {t('vehicle.mileageHistory.title')}
        </div>
        {skipped > 0 && (
          <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-text-secondary">
            {t('vehicle.mileageHistory.skipped', { count: skipped })}
          </span>
        )}
      </div>

      {withMileage.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <h3 className="font-display text-base font-bold text-text-primary">
            {t('vehicle.mileageHistory.empty.title')}
          </h3>
          <p className="mx-auto mt-1.5 max-w-[320px] text-sm leading-relaxed text-text-secondary">
            {t('vehicle.mileageHistory.empty.description')}
          </p>
        </div>
      ) : (
        <>
          {withMileage.length === 1 && (
            <p className="mb-2 text-xs text-text-secondary">{t('vehicle.mileageHistory.chartNeedsMore')}</p>
          )}
          <MileageHistoryChart records={withMileage} />
        </>
      )}
    </div>
  )
}
