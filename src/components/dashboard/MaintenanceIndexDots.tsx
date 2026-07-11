import { useTranslation } from 'react-i18next'

export function MaintenanceIndexDots({ pct }: { pct: number }) {
  const { t } = useTranslation()
  const totalDots = 20
  const filledDots = Math.round((pct / 100) * totalDots)

  return (
    <div className="rounded-[20px] bg-surface p-5 shadow-sm">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-xs font-bold text-text-primary">
          <CheckIcon />
          {t('vehicle.stats.maintIndex')}
        </div>
        <span className="font-display text-base font-extrabold text-text-primary">{pct}%</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: totalDots }, (_, i) => (
          <div key={i} className={`h-[11px] w-[11px] rounded-[3px] ${i < filledDots ? 'bg-lime' : 'bg-surface-muted'}`} />
        ))}
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
