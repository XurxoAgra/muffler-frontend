import { GlassPanel } from '../ui/GlassPanel'
import { VerifiedBadge } from './VerifiedBadge'
import { formatDate, formatMileage, formatCost } from './formatters'
import type { MaintenanceRecord } from '../../lib/types'

interface MaintenanceRecordCardProps {
  record: MaintenanceRecord
  onEdit: (record: MaintenanceRecord) => void
  onDelete: (record: MaintenanceRecord) => void
}

function EditIcon() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

export function MaintenanceRecordCard({ record, onEdit, onDelete }: MaintenanceRecordCardProps) {
  return (
    <GlassPanel rounded="rounded-xl" className="p-4">
      <div className="mb-3">
        <div className="font-mono text-xs text-muted">{formatDate(record.serviceDate)}</div>
        <div className="mt-0.5 font-display text-base font-medium text-white">{record.type}</div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        {record.shopName && (
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted">Taller</div>
            <div className="mt-0.5 text-sm text-white">{record.shopName}</div>
          </div>
        )}
        {record.mileage !== null && (
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted">Km</div>
            <div className="mt-0.5 font-mono text-sm text-white">{formatMileage(record.mileage)}</div>
          </div>
        )}
        {record.cost && (
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted">Coste</div>
            <div className="mt-0.5 font-mono text-sm text-white">{formatCost(record.cost)}</div>
          </div>
        )}
        {record.nextServiceDate && (
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Próxima revisión
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
            onClick={() => onEdit(record)}
            title="Editar"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-white"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            onClick={() => onDelete(record)}
            title="Eliminar"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </GlassPanel>
  )
}
