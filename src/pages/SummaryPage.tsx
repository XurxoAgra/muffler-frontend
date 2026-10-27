import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { StatCard } from '../components/dashboard/StatCard'
import { PageSkeleton } from '../components/ui/Skeleton'
import { MileageBubbles } from '../components/dashboard/MileageBubbles'
import { MaintenanceIndexDots } from '../components/dashboard/MaintenanceIndexDots'
import { MonthlySpendChart } from '../components/dashboard/MonthlySpendChart'
import { useFleetData } from '../vehicles/FleetDataContext'
import { useMaintenanceRecordTypes } from '../maintenance/useMaintenanceRecordTypes'
import {
  computeAvgCost,
  computeMaintenanceIndexPct,
  computeMileageBubbles,
  computeMonthlyTotals,
  deriveUpcoming,
} from '../lib/fleetInsights'
import { formatCost, formatDate } from '../components/maintenance/formatters'
import { useCountUp } from '../lib/useCountUp'
import BuildOutlined from '@mui/icons-material/BuildOutlined'
import EventOutlined from '@mui/icons-material/EventOutlined'

export function SummaryPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { vehicles, recordsByVehicle, loading, error } = useFleetData()
  const { labelOf } = useMaintenanceRecordTypes()

  const upcoming = useMemo(() => (vehicles ? deriveUpcoming(vehicles, recordsByVehicle) : []), [vehicles, recordsByVehicle])
  const mileageBubbles = useMemo(() => (vehicles ? computeMileageBubbles(vehicles, recordsByVehicle) : []), [vehicles, recordsByVehicle])
  const monthlyTotals = useMemo(() => computeMonthlyTotals(recordsByVehicle), [recordsByVehicle])
  const { avg: avgCost, count: reviewCount } = useMemo(() => computeAvgCost(recordsByVehicle), [recordsByVehicle])
  const maintIndexPct = useMemo(() => (vehicles ? computeMaintenanceIndexPct(vehicles, upcoming) : 100), [vehicles, upcoming])
  const nextReview = useMemo(() => upcoming.find((u) => u.status !== 'vencida') ?? upcoming[0] ?? null, [upcoming])
  const shownAvgCost = useCountUp(avgCost)

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-[26px]">
        {t('summary.page.title')}
      </h1>
      <p className="mb-6 text-sm text-text-secondary">{t('summary.page.subtitle')}</p>

      {loading && <PageSkeleton />}
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {!loading && !error && vehicles && vehicles.length === 0 && (
        <div className="rounded-[22px] bg-surface shadow-sm">
          <div className="flex flex-col items-center gap-5 px-10 py-16 text-center">
            <h3 className="font-display text-lg font-bold text-text-primary">{t('maintenance.noVehicles.title')}</h3>
            <p className="max-w-[280px] text-sm leading-relaxed text-text-secondary">
              {t('maintenance.noVehicles.description')}
            </p>
            <button
              type="button"
              onClick={() => navigate('/vehicles')}
              className="inline-flex items-center gap-2 rounded-2xl bg-lime px-6 py-3 font-display text-sm font-bold text-black pressable"
            >
              {t('maintenance.noVehicles.cta')}
            </button>
          </div>
        </div>
      )}

      {!loading && !error && vehicles && vehicles.length > 0 && (
        <div className="stagger">
          <div className="mb-4 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            {mileageBubbles.length > 0 && <MileageBubbles bubbles={mileageBubbles} />}
            <div className="flex flex-col gap-4">
              <StatCard
                icon={<CalendarIcon />}
                title={t('vehicle.stats.nextReview')}
                value={nextReview ? formatDate(nextReview.date) : '—'}
                aside={
                  nextReview && (
                    <div className="max-w-[110px] text-right text-[11.5px] text-text-secondary">
                      {labelOf(nextReview.maintenanceRecordTypeId) ?? '—'}
                      <br />
                      {nextReview.vehicleLabel}
                    </div>
                  )
                }
              />
              <StatCard
                icon={<WrenchIcon />}
                title={t('vehicle.stats.avgCost')}
                value={formatCost(shownAvgCost.toFixed(2))}
                aside={
                  <span className="rounded-lg bg-tag-bg px-2.5 py-1 text-[11px] font-extrabold text-tag-fg">
                    {t('vehicle.stats.reviewCount', { count: reviewCount })}
                  </span>
                }
              />
            </div>
          </div>

          <div className="mb-4">
            <MaintenanceIndexDots pct={maintIndexPct} />
          </div>

          <MonthlySpendChart totals={monthlyTotals} />
        </div>
      )}
    </div>
  )
}

function CalendarIcon() {
  return <EventOutlined className="text-text-secondary" sx={{ fontSize: 15 }} />
}

function WrenchIcon() {
  return <BuildOutlined className="text-text-secondary" sx={{ fontSize: 15 }} />
}
