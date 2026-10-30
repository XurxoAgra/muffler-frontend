import { useTranslation } from 'react-i18next'
import { getVehicleLabel, todayIso } from '../../lib/fleetInsights'
import { formatDate, formatMileage } from '../maintenance/formatters'
import { ExportButton } from './ExportButton'
import { useVehicleExport, type ExportFormat } from '../../vehicles/useVehicleExport'
import type { VehicleListItem } from '../../lib/types'
import Build from '@mui/icons-material/Build'
import DirectionsCarOutlined from '@mui/icons-material/DirectionsCarOutlined'
import Event from '@mui/icons-material/Event'

interface VehicleCardProps {
  vehicle: VehicleListItem
  tint: string
  mileage: number | null
  onOpen: (vehicle: VehicleListItem) => void
}

const EXPORT_FORMATS: ExportFormat[] = ['pdf', 'csv']

export function VehicleCard({ vehicle, tint, mileage, onOpen }: VehicleCardProps) {
  const { t } = useTranslation()
  const { exporting, error: exportError, exportRecords } = useVehicleExport(vehicle)

  const hasRevisions = vehicle.revisionsCount > 0
  // The API only returns dates from today on, but the list can outlive midnight while the page stays open.
  const overdue = vehicle.nextRevisionDate !== null && vehicle.nextRevisionDate < todayIso()

  return (
    <div
      onClick={() => onOpen(vehicle)}
      className="flex cursor-pointer flex-col rounded-[20px] bg-surface p-5 shadow-sm pressable hover:shadow-md"
    >
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px]" style={{ background: tint }}>
          <CarIcon />
        </div>
        <span className="rounded-lg bg-surface-muted px-2.5 py-1.5 font-mono text-[11.5px] font-extrabold tracking-widest text-text-secondary">
          {vehicle.plate}
        </span>
      </div>

      <div className="font-display text-base font-extrabold text-text-primary">{getVehicleLabel(vehicle)}</div>
      <div className="mt-0.5 text-[12.5px] text-text-secondary">
        {vehicle.year} · {formatMileage(mileage)}
      </div>

      <div className="mt-2.5 flex flex-col gap-1 text-[12px] text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Build sx={{ fontSize: 13 }} />
          {hasRevisions ? t('vehicle.card.revisions', { count: vehicle.revisionsCount }) : t('vehicle.card.noRevisions')}
        </div>
        <div className={`flex items-center gap-1.5 ${overdue ? 'font-semibold text-danger' : ''}`}>
          <Event sx={{ fontSize: 13 }} />
          {vehicle.nextRevisionDate === null
            ? t('vehicle.card.noNextRevision')
            : t(overdue ? 'vehicle.card.overdue' : 'vehicle.card.nextRevision', {
                date: formatDate(vehicle.nextRevisionDate),
              })}
        </div>
      </div>

      {/* The whole card navigates, so clicks on the action row must not bubble up to it. */}
      <div className="mt-4 flex items-stretch gap-1.5" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onOpen(vehicle)}
          className="flex-1 rounded-lg border border-border-soft py-2 text-xs font-semibold text-text-secondary transition-colors hover:border-lime hover:text-lime"
        >
          {t('vehicle.detail.viewMore')}
        </button>
        {/* Export is a VIEW permission on the backend, so owners and shared users both get it. */}
        {EXPORT_FORMATS.map((format) => (
          <ExportButton
            key={format}
            format={format}
            size="md"
            busy={exporting === format}
            disabled={!hasRevisions || exporting !== null}
            disabledReason={hasRevisions ? undefined : t('vehicle.card.noRecordsToExport')}
            onClick={() => void exportRecords(format)}
          />
        ))}
      </div>

      {exportError && (
        <p role="alert" className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
          {exportError}
        </p>
      )}
    </div>
  )
}

function CarIcon() {
  return <DirectionsCarOutlined sx={{ fontSize: 23, color: '#14150F' }} />
}
