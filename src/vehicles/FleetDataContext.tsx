import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch, ApiError } from '../lib/apiClient'
import type { MaintenanceRecord, Vehicle } from '../lib/types'

interface FleetDataContextValue {
  vehicles: Vehicle[] | null
  recordsByVehicle: Record<string, MaintenanceRecord[]>
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const FleetDataContext = createContext<FleetDataContextValue | null>(null)

export function FleetDataProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null)
  const [recordsByVehicle, setRecordsByVehicle] = useState<Record<string, MaintenanceRecord[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const vehicleList = await apiFetch<Vehicle[]>('/api/vehicles', { authenticated: true })
      setVehicles(vehicleList)

      const entries = await Promise.all(
        vehicleList.map(async (vehicle) => {
          const records = await apiFetch<MaintenanceRecord[]>(
            `/api/vehicles/${vehicle.id}/maintenance-records`,
            { authenticated: true },
          )
          return [vehicle.id, records] as const
        }),
      )
      setRecordsByVehicle(Object.fromEntries(entries))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('vehicle.errors.load'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern
    void load()
  }, [load])

  return (
    <FleetDataContext.Provider value={{ vehicles, recordsByVehicle, loading, error, refetch: load }}>
      {children}
    </FleetDataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook are colocated by convention in this codebase
export function useFleetData() {
  const ctx = useContext(FleetDataContext)
  if (!ctx) throw new Error('useFleetData must be used within a FleetDataProvider')
  return ctx
}
