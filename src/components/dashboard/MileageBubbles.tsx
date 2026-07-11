import { useTranslation } from 'react-i18next'
import type { MileageBubble } from '../../lib/fleetInsights'

export function MileageBubbles({ bubbles }: { bubbles: MileageBubble[] }) {
  const { t } = useTranslation()

  return (
    <div className="rounded-[20px] bg-surface p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 font-display text-xs font-bold text-text-primary">
        <CarIcon />
        {t('vehicle.stats.mileage')}
      </div>

      <div className="flex items-center justify-center gap-4 py-2">
        {bubbles.map((b) => (
          <div
            key={b.vehicleId}
            className="flex flex-shrink-0 flex-col items-center justify-center rounded-full"
            style={{ width: b.sizePx, height: b.sizePx, background: b.tint }}
          >
            <span className="font-display font-extrabold text-black" style={{ fontSize: b.fontSizePx }}>
              {(b.km / 1000).toFixed(1)}k
            </span>
            <span className="text-[10px] text-black opacity-75">km</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-4">
        {bubbles.map((b) => (
          <div key={b.vehicleId} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-text-secondary">
            <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: b.tint }} />
            {b.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function CarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
      <path d="M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13" />
      <rect x="2" y="13" width="20" height="6" rx="2" />
      <circle cx="7" cy="19" r="1.6" />
      <circle cx="17" cy="19" r="1.6" />
    </svg>
  )
}
