import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDate, formatMileage } from '../maintenance/formatters'
import type { MaintenanceRecord } from '../../lib/types'

const HEIGHT = 200
const PAD = { top: 14, right: 14, bottom: 26, left: 52 }
const Y_TICKS = 4

interface MileageHistoryChartProps {
  /** Records that already carry a mileage; any order, the chart sorts by serviceDate itself. */
  records: MaintenanceRecord[]
}

/**
 * Hand-rolled SVG, like the other charts in this app (MonthlySpendChart, SpendByVehicleBars):
 * there is no charting dependency and adding one for a single line would be the only one.
 * The width is measured rather than set through preserveAspectRatio so dots stay round.
 */
export function MileageHistoryChart({ records }: MileageHistoryChartProps) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const resizeObserver = new ResizeObserver(() => setWidth(el.clientWidth))
    resizeObserver.observe(el)
    setWidth(el.clientWidth)

    return () => resizeObserver.disconnect()
  }, [])

  const points = useMemo(() => {
    const sorted = [...records].sort(
      (a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime(),
    )
    if (sorted.length === 0 || width === 0) return []

    const times = sorted.map((r) => new Date(r.serviceDate).getTime())
    const kms = sorted.map((r) => r.mileage!)
    const minT = Math.min(...times)
    const maxT = Math.max(...times)
    const minKm = Math.min(...kms)
    const maxKm = Math.max(...kms)

    const innerW = Math.max(1, width - PAD.left - PAD.right)
    const innerH = HEIGHT - PAD.top - PAD.bottom
    // A single record, or several on the same day / at the same km, collapses the range:
    // pin those to the middle instead of dividing by zero.
    const spanT = maxT - minT
    const spanKm = maxKm - minKm

    return sorted.map((record, i) => ({
      record,
      x: PAD.left + (spanT === 0 ? innerW / 2 : ((times[i] - minT) / spanT) * innerW),
      y: PAD.top + (spanKm === 0 ? innerH / 2 : innerH - ((kms[i] - minKm) / spanKm) * innerH),
    }))
  }, [records, width])

  const yTicks = useMemo(() => {
    if (records.length === 0) return []
    const kms = records.map((r) => r.mileage!)
    const minKm = Math.min(...kms)
    const maxKm = Math.max(...kms)
    const innerH = HEIGHT - PAD.top - PAD.bottom

    if (minKm === maxKm) return [{ km: minKm, y: PAD.top + innerH / 2 }]

    return Array.from({ length: Y_TICKS + 1 }, (_, i) => ({
      km: Math.round(minKm + ((maxKm - minKm) * i) / Y_TICKS),
      y: PAD.top + innerH - (innerH * i) / Y_TICKS,
    }))
  }, [records])

  const linePath = points.length > 1 ? points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') : null
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]

  return (
    <div ref={containerRef} className="w-full">
      {width > 0 && points.length > 0 && (
        <svg width={width} height={HEIGHT} role="img" aria-label={t('vehicle.mileageHistory.chartLabel')}>
          {yTicks.map((tick) => (
            <g key={tick.km}>
              <line
                x1={PAD.left}
                y1={tick.y}
                x2={width - PAD.right}
                y2={tick.y}
                stroke="var(--color-border-soft)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={tick.y + 3.5}
                textAnchor="end"
                className="font-mono text-[9px]"
                fill="var(--color-text-secondary)"
              >
                {tick.km.toLocaleString()}
              </text>
            </g>
          ))}

          {linePath && <path d={linePath} fill="none" stroke="var(--color-lime)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}

          {points.map(({ record, x, y }) => (
            <circle key={record.id} cx={x} cy={y} r={4} fill="var(--color-lime)">
              <title>{`${formatDate(record.serviceDate)} · ${formatMileage(record.mileage)}`}</title>
            </circle>
          ))}

          {firstPoint && (
            <text x={PAD.left} y={HEIGHT - 8} className="font-mono text-[9px]" fill="var(--color-text-secondary)">
              {formatDate(firstPoint.record.serviceDate)}
            </text>
          )}
          {lastPoint && lastPoint !== firstPoint && (
            <text
              x={width - PAD.right}
              y={HEIGHT - 8}
              textAnchor="end"
              className="font-mono text-[9px]"
              fill="var(--color-text-secondary)"
            >
              {formatDate(lastPoint.record.serviceDate)}
            </text>
          )}
        </svg>
      )}
    </div>
  )
}
