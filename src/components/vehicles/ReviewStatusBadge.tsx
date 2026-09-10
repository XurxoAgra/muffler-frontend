import { useTranslation } from 'react-i18next'
import { formatDate } from '../maintenance/formatters'
import type { ReviewStatus } from '../../lib/fleetInsights'

interface ReviewStatusBadgeProps {
  /** Already-translated name of the review this badge tracks (ITV, insurance, …). */
  label: string
  /** null when the vehicle has no record of this type with a next service date. */
  status: ReviewStatus | null
  date: string | null
}

const DOT_COLOR: Record<ReviewStatus, string> = {
  vencida: 'bg-danger',
  proxima: 'bg-warning',
  programada: 'bg-success',
}

export function ReviewStatusBadge({ label, status, date }: ReviewStatusBadgeProps) {
  const { t } = useTranslation()

  const statusText =
    status === 'vencida'
      ? t('maintenance.stats.overdue')
      : status === 'proxima'
        ? t('maintenance.stats.dueSoon')
        : status === 'programada'
          ? t('vehicle.detail.statusValid')
          : t('vehicle.detail.statusUnknown')

  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-surface-muted px-2.5 py-1.5">
      <span className={`h-2 w-2 flex-shrink-0 rounded-full ${status ? DOT_COLOR[status] : 'bg-text-secondary'}`} />
      <span className="font-mono text-[11px] uppercase tracking-widest text-text-secondary">{label}</span>
      <span className="text-[11.5px] font-bold text-text-primary">
        {statusText}
        {date && ` · ${formatDate(date)}`}
      </span>
    </div>
  )
}
