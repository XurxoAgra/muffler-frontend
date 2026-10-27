import { useTranslation } from 'react-i18next'
import type { MileageBubble } from '../../lib/fleetInsights'
import DirectionsCarOutlined from '@mui/icons-material/DirectionsCarOutlined'

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
  return <DirectionsCarOutlined className="text-text-secondary" sx={{ fontSize: 16 }} />
}
