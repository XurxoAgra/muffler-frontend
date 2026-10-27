import { useTranslation } from 'react-i18next'
import type { MonthlyTotal } from '../../lib/fleetInsights'
import DirectionsCarOutlined from '@mui/icons-material/DirectionsCarOutlined'

export function MonthlySpendChart({ totals }: { totals: MonthlyTotal[] }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'en' ? 'en-GB' : 'es-ES'
  const formatter = new Intl.DateTimeFormat(locale, { month: 'short' })
  // Twelve short labels don't fit a phone-width card, so mobile shows initials.
  const narrowFormatter = new Intl.DateTimeFormat(locale, { month: 'narrow' })

  const max = Math.max(...totals.map((m) => m.total), 1)
  const currentMonth = new Date().getMonth()

  return (
    <div className="mb-6 rounded-[22px] bg-analytics-card p-6 shadow-sm shadow-analytics-shadow">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-sm font-bold text-analytics-fg">
          <CarIcon />
          {t('vehicle.stats.monthlySpend')}
        </div>
        <span className="rounded-[10px] bg-analytics-chip px-3 py-1.5 text-[11.5px] font-bold text-muted">{t('vehicle.stats.annual')}</span>
      </div>

      <div className="flex h-[120px] items-end gap-1 sm:gap-2.5">
        {totals.map(({ month, total }) => {
          const isCurrent = month === currentMonth
          const heightPct = Math.max(4, Math.round((total / max) * 100))
          return (
            <div key={month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <div
                className={`w-full max-w-[22px] origin-bottom animate-grow-y rounded-[6px] ${isCurrent ? 'bg-analytics-accent' : total > 0 ? 'bg-analytics-bar' : 'bg-analytics-bar-empty'}`}
                style={{ height: `${heightPct}%`, minHeight: 4 }}
              />
              <span className={`text-[10.5px] font-bold ${isCurrent ? 'text-lime' : 'text-muted'}`}>
                <span aria-hidden="true" className="sm:hidden">
                  {narrowFormatter.format(new Date(2000, month, 1))}
                </span>
                <span className="sr-only sm:not-sr-only">{formatter.format(new Date(2000, month, 1))}</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CarIcon() {
  return <DirectionsCarOutlined className="text-analytics-accent" sx={{ fontSize: 16 }} />
}
