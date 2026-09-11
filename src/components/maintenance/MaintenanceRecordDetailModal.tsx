import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { ButtonGlass } from '../ui/ButtonGlass'
import { VerifiedBadge } from './VerifiedBadge'
import { formatDate, formatMileage, formatCost } from './formatters'
import { useMaintenanceRecordTypes } from '../../maintenance/useMaintenanceRecordTypes'
import { apiFetch, ApiError } from '../../lib/apiClient'
import type { MaintenanceRecord } from '../../lib/types'

interface MaintenanceRecordDetailModalProps {
  /** Row already in memory: painted immediately, then revalidated against the detail endpoint. */
  record: MaintenanceRecord
  onClose: () => void
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className="mt-0.5 text-sm text-white">{value}</div>
    </div>
  )
}

export function MaintenanceRecordDetailModal({ record, onClose }: MaintenanceRecordDetailModalProps) {
  const { t } = useTranslation()
  const { labelOf } = useMaintenanceRecordTypes()
  const [detail, setDetail] = useState<MaintenanceRecord>(record)
  const [error, setError] = useState<string | null>(null)

  const recordId = record.id

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const fresh = await apiFetch<MaintenanceRecord>(`/api/maintenance-records/${recordId}`, {
          authenticated: true,
        })
        if (!cancelled) setDetail(fresh)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : t('maintenance.errors.loadRecord'))
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [recordId, t])

  return (
    <Modal onClose={onClose}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-xs text-muted">{formatDate(detail.serviceDate)}</div>
          <h2 className="mt-0.5 font-display text-lg font-bold text-white">
            {labelOf(detail.maintenanceRecordTypeId) ?? t('maintenance.detail.title')}
          </h2>
        </div>
        <VerifiedBadge verified={detail.verified} />
      </div>

      {error && <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <Field label={t('maintenance.fields.shop')} value={detail.shopName ?? '—'} />
        <Field label={t('maintenance.fields.km')} value={formatMileage(detail.mileage)} />
        <Field label={t('maintenance.fields.cost')} value={formatCost(detail.cost)} />
        <Field label={t('maintenance.fields.nextService')} value={formatDate(detail.nextServiceDate)} />
        <Field label={t('maintenance.detail.createdAt')} value={formatDate(detail.createdAt)} />
        {detail.invoiceId && <Field label={t('maintenance.detail.invoice')} value={detail.invoiceId} />}
      </div>

      {detail.notes && (
        <div className="mt-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
            {t('maintenance.fields.notes')}
          </div>
          <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted">{detail.notes}</p>
        </div>
      )}

      <ButtonGlass type="button" className="mt-6 w-full" onClick={onClose}>
        {t('common.close')}
      </ButtonGlass>
    </Modal>
  )
}
