import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch, ApiError } from '../lib/apiClient'
import type { VehicleUser } from '../lib/types'

export interface UseVehicleUsersResult {
  users: VehicleUser[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  inviteVehicleUser: (email: string) => Promise<VehicleUser>
  revokeVehicleUser: (userId: string) => Promise<void>
}

/** Users with access to one vehicle (the owner plus any shared invitees). */
export function useVehicleUsers(vehicleId: string | undefined): UseVehicleUsersResult {
  const { t } = useTranslation()
  const [users, setUsers] = useState<VehicleUser[]>([])
  const [loading, setLoading] = useState(vehicleId !== undefined)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!vehicleId) {
      setUsers([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<VehicleUser[]>(`/api/vehicles/${vehicleId}/users`, {
        authenticated: true,
      })
      setUsers(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('vehicle.users.errors.load'))
    } finally {
      setLoading(false)
    }
  }, [vehicleId, t])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern, same as useMileageHistory
    void load()
  }, [load])

  const inviteVehicleUser = useCallback(
    async (email: string) => {
      if (!vehicleId) throw new Error('inviteVehicleUser called without a vehicleId')
      return apiFetch<VehicleUser>(`/api/vehicles/${vehicleId}/users`, {
        method: 'POST',
        body: { email },
        authenticated: true,
      })
    },
    [vehicleId],
  )

  const revokeVehicleUser = useCallback(
    async (userId: string) => {
      if (!vehicleId) throw new Error('revokeVehicleUser called without a vehicleId')
      await apiFetch<void>(`/api/vehicles/${vehicleId}/users/${userId}`, {
        method: 'DELETE',
        authenticated: true,
      })
    },
    [vehicleId],
  )

  return { users, loading, error, refetch: load, inviteVehicleUser, revokeVehicleUser }
}
