import { useTranslation } from 'react-i18next'
import { formatDate } from '../maintenance/formatters'
import { useMaintenanceRecordTypes } from '../../maintenance/useMaintenanceRecordTypes'
import type { UpcomingItem } from '../../lib/fleetInsights'
import EventOutlined from '@mui/icons-material/EventOutlined'
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined'

const ROW_BG: Record<UpcomingItem['status'], string> = {
  vencida: 'bg-row-overdue',
  proxima: 'bg-row-upcoming',
  programada: 'bg-row-default',
}

const BADGE_BG: Record<UpcomingItem['status'], string> = {
  vencida: '#C24C42',
  proxima: '#C79A2E',
  programada: '#14150F',
}

export function UpcomingReviewsList({ items }: { items: UpcomingItem[] }) {
  const { t } = useTranslation()
  const { labelOf } = useMaintenanceRecordTypes()

  return (
    <div className="rounded-[20px] bg-surface p-5 shadow-sm">
      <div className="mb-3 font-display text-sm font-bold text-text-primary">{t('maintenance.stats.upcoming')}</div>
      <div className="stagger flex flex-col gap-2.5">
        {items.map((item) => (
          <div key={item.vehicleId} className={`flex flex-col gap-1.5 rounded-[13px] p-2.5 ${ROW_BG[item.status]}`}>
            <div className="flex min-w-0 items-center gap-2.5">
              <div
                className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px]"
                style={{ background: BADGE_BG[item.status] }}
              >
                <CalendarIcon />
              </div>
              <div className="min-w-0 flex-1">
                <div className="break-words text-[12.5px] font-bold text-text-primary">
                  {labelOf(item.maintenanceRecordTypeId) ?? '—'}
                </div>
                <div className="break-words text-[11.5px] leading-snug text-text-secondary">
                  {item.vehicleLabel} · <span className="whitespace-nowrap">{formatDate(item.date)}</span>
                </div>
              </div>
            </div>
            {item.status !== 'programada' && (
              <div
                className="ml-[45px] flex w-fit items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10.5px] font-extrabold"
                style={{ color: BADGE_BG[item.status] }}
              >
                <AlertIcon color={BADGE_BG[item.status]} />
                {item.status === 'vencida' ? t('maintenance.stats.overdue') : t('maintenance.stats.dueSoon')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CalendarIcon() {
  return <EventOutlined sx={{ fontSize: 16, color: '#fff' }} />
}

function AlertIcon({ color }: { color: string }) {
  return <WarningAmberOutlined sx={{ fontSize: 11, color }} />
}
