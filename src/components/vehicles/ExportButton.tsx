import { useTranslation } from 'react-i18next'
import type { ExportFormat } from '../../vehicles/useVehicleExport'
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined'

interface ExportButtonProps {
  format: ExportFormat
  busy: boolean
  disabled: boolean
  /** Shown as the tooltip while disabled, e.g. when there is nothing to export. */
  disabledReason?: string
  /** `md` matches the height of the card's full-width buttons. */
  size?: 'sm' | 'md'
  onClick: () => void
}

const SIZE_CLASS: Record<NonNullable<ExportButtonProps['size']>, string> = {
  sm: 'px-2.5 py-1',
  md: 'px-2.5 py-2',
}

export function ExportButton({ format, busy, disabled, disabledReason, size = 'sm', onClick }: ExportButtonProps) {
  const { t } = useTranslation()
  const label = format === 'pdf' ? t('vehicle.export.pdf') : t('vehicle.export.csv')
  const reason = disabled && !busy ? disabledReason : undefined

  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={busy}
      aria-label={reason ? `${label}. ${reason}` : label}
      title={busy ? t('vehicle.export.exporting') : (reason ?? label)}
      className={`inline-flex items-center gap-1 rounded-lg border border-border-soft ${SIZE_CLASS[size]} font-display text-[11px] font-bold tracking-wide text-text-secondary transition-colors enabled:hover:border-lime enabled:hover:text-lime ${busy ? 'cursor-wait' : 'disabled:cursor-not-allowed disabled:opacity-50'}`}
    >
      {/* Spinner takes the icon's slot so the button keeps its width while busy. */}
      {busy ? <SpinnerIcon /> : <DownloadIcon />}
      {/* The acronym reads the same in every locale; the full action lives in aria-label/title. */}
      {format.toUpperCase()}
    </button>
  )

  // Disabled buttons swallow pointer events in some browsers, so the tooltip lives on a wrapper.
  return reason ? (
    <span title={reason} className="inline-flex">
      {button}
    </span>
  ) : (
    button
  )
}

function DownloadIcon() {
  return <FileDownloadOutlined sx={{ fontSize: 12 }} />
}

function SpinnerIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.2-8.56" />
    </svg>
  )
}
