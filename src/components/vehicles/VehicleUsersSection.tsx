import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { ButtonGlass } from '../ui/ButtonGlass'
import { VehicleInviteUserModal } from './VehicleInviteUserModal'
import { useVehicleUsers } from '../../vehicles/useVehicleUsers'
import { ApiError } from '../../lib/apiClient'
import type { Vehicle, VehicleUser } from '../../lib/types'

interface VehicleUsersSectionProps {
  vehicle: Vehicle
  /** The signed-in user's own id, so their own row can be told apart from the rest. */
  currentUserId: string | undefined
  /** Called after the signed-in user successfully revokes their own (shared) access. */
  onLeft: () => void
}

type ConfirmState = { kind: 'revoke'; user: VehicleUser } | { kind: 'leave'; user: VehicleUser } | null

export function VehicleUsersSection({ vehicle, currentUserId, onLeft }: VehicleUsersSectionProps) {
  const { t } = useTranslation()
  const { users, loading, error, refetch, inviteVehicleUser, revokeVehicleUser } = useVehicleUsers(vehicle.id)

  const [inviting, setInviting] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmState>(null)
  const [acting, setActing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const isOwner = vehicle.role === 'owner'

  function closeConfirm() {
    setConfirm(null)
    setActionError(null)
  }

  async function handleConfirm() {
    if (!confirm) return
    setActing(true)
    setActionError(null)
    try {
      await revokeVehicleUser(confirm.user.userId)
      if (confirm.kind === 'leave') {
        onLeft()
        return
      }
      await refetch()
      setConfirm(null)
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t('vehicle.users.errors.revoke'))
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="mb-5 rounded-[20px] bg-surface p-5 shadow-sm">
      <div className="mb-3.5 flex flex-wrap items-center gap-3">
        <div className="font-display text-[14.5px] font-extrabold text-text-primary">
          {t('vehicle.users.title')}
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={() => setInviting(true)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-lime px-3 py-1.5 font-display text-xs font-bold text-black transition-opacity hover:opacity-90"
          >
            <PlusIcon /> {t('vehicle.users.invite')}
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-text-secondary">{t('common.loading')}</p>}
      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {!loading && !error && (
        <div className="flex flex-col gap-2">
          {users.map((user) => {
            const isSelf = currentUserId !== undefined && user.userId === currentUserId
            return (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-soft px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-text-primary">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="truncate font-mono text-xs text-text-secondary">{user.email}</div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  <RoleBadge role={user.role} />

                  {isOwner && user.role === 'shared' && (
                    <button
                      type="button"
                      onClick={() => setConfirm({ kind: 'revoke', user })}
                      className="rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-danger transition-colors hover:bg-danger/10"
                    >
                      {t('vehicle.users.revoke')}
                    </button>
                  )}

                  {!isOwner && isSelf && (
                    <button
                      type="button"
                      onClick={() => setConfirm({ kind: 'leave', user })}
                      className="rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-danger transition-colors hover:bg-danger/10"
                    >
                      {t('vehicle.users.leave')}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {inviting && (
        <VehicleInviteUserModal
          onSubmit={inviteVehicleUser}
          onClose={() => setInviting(false)}
          onInvited={async () => {
            setInviting(false)
            await refetch()
          }}
        />
      )}

      {confirm && (
        <Modal onClose={closeConfirm}>
          <p className="text-sm text-white">
            {confirm.kind === 'revoke'
              ? t('vehicle.users.revokeConfirm', { email: confirm.user.email })
              : t('vehicle.users.leaveConfirm')}
          </p>
          {actionError && <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{actionError}</p>}
          <div className="mt-6 flex gap-3">
            <ButtonGlass type="button" className="flex-1" onClick={closeConfirm}>
              {t('common.cancel')}
            </ButtonGlass>
            <button
              type="button"
              disabled={acting}
              onClick={handleConfirm}
              className="flex-1 rounded-full bg-danger px-6 py-3 font-display font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {acting
                ? t('vehicle.users.revoking')
                : confirm.kind === 'revoke'
                  ? t('vehicle.users.revoke')
                  : t('vehicle.users.leave')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: VehicleUser['role'] }) {
  const { t } = useTranslation()
  return (
    <span
      className={`rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-extrabold uppercase tracking-widest ${
        role === 'owner' ? 'bg-lime/15 text-lime' : 'bg-surface-muted text-text-secondary'
      }`}
    >
      {role === 'owner' ? t('vehicle.users.roleOwner') : t('vehicle.users.roleShared')}
    </span>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
