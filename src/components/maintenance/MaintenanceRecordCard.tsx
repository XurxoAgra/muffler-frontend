import { useTranslation } from 'react-i18next'
import { GlassPanel } from '../ui/GlassPanel'
import { VerifiedBadge } from './VerifiedBadge'
import { formatDate, formatMileage, formatCost } from './formatters'
import { useMaintenanceRecordTypes } from '../../maintenance/useMaintenanceRecordTypes'
import type { MaintenanceRecord } from '../../lib/types'
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined'

interface MaintenanceRecordCardProps {
  record: MaintenanceRecord
  onView: (record: MaintenanceRecord) => void
  onEdit: (record: MaintenanceRecord) => void
  onDelete: (record: MaintenanceRecord) => void
}

function EyeIcon() {
  return <VisibilityOutlined sx={{ fontSize: 15 }} />
}

function EditIcon() {
  return <EditOutlined sx={{ fontSize: 15 }} />
}

function TrashIcon() {
  return <DeleteOutlineOutlined sx={{ fontSize: 15 }} />
}

export function MaintenanceRecordCard({ record, onView, onEdit, onDelete }: MaintenanceRecordCardProps) {
  const { t } = useTranslation()
  const { labelOf } = useMaintenanceRecordTypes()

  return (
    <GlassPanel rounded="rounded-xl" className="p-4">
      <div className="mb-3">
        <div className="font-mono text-xs text-muted">{formatDate(record.serviceDate)}</div>
        <div className="mt-0.5 font-display text-base font-medium text-white">
          {labelOf(record.maintenanceRecordTypeId) ?? '—'}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        {record.shopName && (
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {t('maintenance.fields.shop')}
            </div>
            <div className="mt-0.5 text-sm text-white">{record.shopName}</div>
          </div>
        )}
        {record.mileage !== null && (
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {t('maintenance.fields.km')}
            </div>
            <div className="mt-0.5 font-mono text-sm text-white">{formatMileage(record.mileage)}</div>
          </div>
        )}
        {record.cost && (
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {t('maintenance.fields.cost')}
            </div>
            <div className="mt-0.5 font-mono text-sm text-white">{formatCost(record.cost)}</div>
          </div>
        )}
        {record.nextServiceDate && (
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {t('maintenance.fields.nextService')}
            </div>
            <div className="mt-0.5 text-sm text-white">{formatDate(record.nextServiceDate)}</div>
          </div>
        )}
      </div>

      {record.notes && (
        <p className="mb-4 text-xs leading-relaxed text-muted">{record.notes}</p>
      )}

      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <VerifiedBadge verified={record.verified} />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onView(record)}
            title={t('maintenance.viewTitle')}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-white"
          >
            <EyeIcon />
          </button>
          <button
            type="button"
            onClick={() => onEdit(record)}
            title={t('maintenance.editTitle')}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-white"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            onClick={() => onDelete(record)}
            title={t('maintenance.deleteTitle')}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </GlassPanel>
  )
}
