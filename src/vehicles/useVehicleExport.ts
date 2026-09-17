import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetchFile, ApiError } from '../lib/apiClient'
import { saveBlob } from '../lib/download'
import { fetchMaintenanceRecordTypes } from '../maintenance/maintenanceRecordTypes'
import type { Vehicle } from '../lib/types'

export type ExportFormat = 'pdf' | 'csv'

export interface UseVehicleExportResult {
  /** Format currently being generated, or null when idle. */
  exporting: ExportFormat | null
  error: string | null
  exportRecords: (format: ExportFormat) => Promise<void>
}

/**
 * Downloads a vehicle's maintenance history. The endpoint needs the bearer token, so the file is
 * fetched as a blob and saved client-side instead of being linked to directly.
 */
export function useVehicleExport(vehicle: Vehicle | null): UseVehicleExportResult {
  const { t, i18n } = useTranslation()
  const [exporting, setExporting] = useState<ExportFormat | null>(null)
  const [error, setError] = useState<string | null>(null)
  // State alone can't stop a second call that lands before the disabled button re-renders.
  const inFlight = useRef(false)

  const exportRecords = useCallback(
    async (format: ExportFormat) => {
      if (!vehicle || inFlight.current) return
      inFlight.current = true
      setExporting(format)
      setError(null)
      try {
        // The backend has no dictionary: it prints the label sent for each type key, or the raw key
        // when none is sent. Every catalog type goes (inactive too) since old records may still use one.
        const types = await fetchMaintenanceRecordTypes()
        const params = new URLSearchParams({ format })
        for (const type of types) {
          const key = `maintenanceRecordType.${type.key}`
          if (!i18n.exists(key)) continue
          const label = t(key).trim()
          if (label) params.append(`labels[${type.key}]`, label)
        }

        const file = await apiFetchFile(
          `/api/vehicles/${vehicle.id}/maintenance-records/export?${params.toString()}`,
          { authenticated: true },
        )
        saveBlob(file.blob, file.filename ?? fallbackFilename(vehicle.plate, t('vehicle.export.filenameSuffix'), format))
      } catch (err) {
        setError(
          err instanceof ApiError && err.status === 422
            ? t('vehicle.export.errors.validation')
            : t('vehicle.export.errors.generic'),
        )
      } finally {
        inFlight.current = false
        setExporting(null)
      }
    },
    [vehicle, t, i18n],
  )

  return { exporting, error, exportRecords }
}

/** Used when Content-Disposition can't be read; slugs the plate the same way the backend does. */
function fallbackFilename(plate: string, suffix: string, format: ExportFormat): string {
  const slug = plate.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return `${[slug, suffix].filter(Boolean).join('-')}.${format}`
}
