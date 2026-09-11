import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch, ApiError } from '../lib/apiClient'
import type { MileageRecord, MileageRecordInput } from '../lib/types'

export interface UseMileageHistoryResult {
  /** Newest first, matching the order the backend already returns. */
  records: MileageRecord[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  addMileageRecord: (input: MileageRecordInput) => Promise<MileageRecord>
}

/**
 * Mileage snapshots for one vehicle. This history is a superset of the maintenance
 * mileages: creating a maintenance record with a mileage also writes a snapshot with
 * source 'maintenance_record', so it is the authoritative source for "current km".
 */
export function useMileageHistory(vehicleId: string | undefined): UseMileageHistoryResult {
  const { t } = useTranslation()
  const [records, setRecords] = useState<MileageRecord[]>([])
  const [loading, setLoading] = useState(vehicleId !== undefined)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!vehicleId) {
      setRecords([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<MileageRecord[]>(`/api/vehicles/${vehicleId}/mileage-records`, {
        authenticated: true,
      })
      setRecords(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('vehicle.errors.loadMileage'))
    } finally {
      setLoading(false)
    }
  }, [vehicleId, t])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern, same as FleetDataProvider
    void load()
  }, [load])

  const addMileageRecord = useCallback(
    async (input: MileageRecordInput) => {
      if (!vehicleId) throw new Error('addMileageRecord called without a vehicleId')
      return apiFetch<MileageRecord>(`/api/vehicles/${vehicleId}/mileage-records`, {
        method: 'POST',
        body: input,
        authenticated: true,
      })
    },
    [vehicleId],
  )

  return { records, loading, error, refetch: load, addMileageRecord }
}

/** Newest snapshot, or null when the vehicle has no mileage history yet. */
export function latestMileage(records: MileageRecord[]): MileageRecord | null {
  if (records.length === 0) return null
  return records.reduce((a, b) => (new Date(a.recordedAt) >= new Date(b.recordedAt) ? a : b))
}
