import { apiFetch } from '../lib/apiClient'
import type { MaintenanceRecordType } from '../lib/types'

/** The catalog is fixed and changes very rarely, so one fetch per hour is plenty. */
const STALE_TIME_MS = 60 * 60 * 1000

let cache: { types: MaintenanceRecordType[]; fetchedAt: number } | null = null
let inFlight: Promise<MaintenanceRecordType[]> | null = null

export function getCachedMaintenanceRecordTypes(): MaintenanceRecordType[] | null {
  if (!cache || Date.now() - cache.fetchedAt > STALE_TIME_MS) return null
  return cache.types
}

export function fetchMaintenanceRecordTypes(): Promise<MaintenanceRecordType[]> {
  const cached = getCachedMaintenanceRecordTypes()
  if (cached) return Promise.resolve(cached)
  if (inFlight) return inFlight

  inFlight = apiFetch<MaintenanceRecordType[]>('/api/maintenance-record-types', { authenticated: true })
    .then((types) => {
      cache = { types, fetchedAt: Date.now() }
      return types
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}

export function clearMaintenanceRecordTypesCache() {
  cache = null
}
