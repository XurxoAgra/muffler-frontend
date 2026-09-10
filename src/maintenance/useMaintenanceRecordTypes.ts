import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchMaintenanceRecordTypes, getCachedMaintenanceRecordTypes } from './maintenanceRecordTypes'
import type { MaintenanceRecordType } from '../lib/types'

export interface UseMaintenanceRecordTypesResult {
  types: MaintenanceRecordType[]
  activeTypes: MaintenanceRecordType[]
  byId: Map<string, MaintenanceRecordType>
  /** Translated label for a catalog id, or null while the catalog is still loading / unknown id. */
  labelOf: (id: string | null | undefined) => string | null
  loading: boolean
  error: string | null
}

/**
 * Reads the maintenance record type catalog. Results are shared and cached across every
 * caller (see maintenanceRecordTypes.ts), so mounting this in several components costs
 * a single request.
 */
export function useMaintenanceRecordTypes(): UseMaintenanceRecordTypesResult {
  const { t } = useTranslation()
  const [types, setTypes] = useState<MaintenanceRecordType[]>(() => getCachedMaintenanceRecordTypes() ?? [])
  const [loading, setLoading] = useState(() => getCachedMaintenanceRecordTypes() === null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchMaintenanceRecordTypes()
      .then((data) => {
        if (cancelled) return
        setTypes(data)
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError(t('maintenance.errors.loadTypes'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [t])

  const byId = useMemo(() => new Map(types.map((type) => [type.id, type])), [types])
  const activeTypes = useMemo(() => types.filter((type) => type.active), [types])

  const labelOf = useCallback(
    (id: string | null | undefined) => {
      if (!id) return null
      const type = byId.get(id)
      return type ? t(`maintenanceRecordType.${type.key}`) : null
    },
    [byId, t],
  )

  return { types, activeTypes, byId, labelOf, loading, error }
}
