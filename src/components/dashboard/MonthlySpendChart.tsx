import { useTranslation } from 'react-i18next'
import type { MonthlyTotal } from '../../lib/fleetInsights'

export function MonthlySpendChart({ totals }: { totals: MonthlyTotal[] }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'en' ? 'en-GB' : 'es-ES'
  const formatter = new Intl.DateTimeFormat(locale, { month: 'short' })

  const max = Math.max(...totals.map((m) => m.total), 1)
  const currentMonth = new Date().getMonth()

  return (
    <div className="mb-6 rounded-[22px] bg-shell p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-sm font-bold text-shell-fg">
          <CarIcon />
          {t('vehicle.stats.monthlySpend')}
        </div>
        <span className="rounded-[10px] bg-white/[0.06] px-3 py-1.5 text-[11.5px] font-bold text-muted">{t('vehicle.stats.annual')}</span>
      </div>

      <div className="flex h-[120px] items-end gap-2.5">
        {totals.map(({ month, total }) => {
          const isCurrent = month === currentMonth
          const heightPct = Math.max(4, Math.round((total / max) * 100))
          return (
            <div key={month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div
                className="w-full max-w-[22px] rounded-[6px]"
                style={{
                  height: `${heightPct}%`,
                  minHeight: 4,
                  background: isCurrent ? '#D7F24C' : total > 0 ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)',
                }}
              />
              <span className={`text-[10.5px] font-bold ${isCurrent ? 'text-lime' : 'text-muted'}`}>
                {formatter.format(new Date(2000, month, 1))}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D7F24C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13" />
      <rect x="2" y="13" width="20" height="6" rx="2" />
      <circle cx="7" cy="19" r="1.6" />
      <circle cx="17" cy="19" r="1.6" />
    </svg>
  )
}
