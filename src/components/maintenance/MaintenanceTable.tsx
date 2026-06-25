import { GlassPanel } from '../ui/GlassPanel'
import { VerifiedBadge } from './VerifiedBadge'
import { formatDate, formatMileage, formatCost } from './formatters'
import type { MaintenanceRecord } from '../../lib/types'

export type SortKey = 'serviceDate' | 'type' | 'mileage' | 'cost' | 'nextServiceDate'

interface MaintenanceTableProps {
  records: MaintenanceRecord[]
  sortKey: SortKey
  sortDir: 'asc' | 'desc'
  onSort: (key: SortKey) => void
  onEdit: (record: MaintenanceRecord) => void
  onDelete: (record: MaintenanceRecord) => void
}

type Column = { key: SortKey | null; label: string }

const COLUMNS: Column[] = [
  { key: 'serviceDate', label: 'Fecha' },
  { key: 'type', label: 'Tipo' },
  { key: null, label: 'Taller' },
  { key: 'mileage', label: 'Km' },
  { key: 'cost', label: 'Coste' },
  { key: 'nextServiceDate', label: 'Próxima revisión' },
  { key: null, label: 'Verificado' },
  { key: null, label: 'Acciones' },
]

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  const isUp = active && dir === 'asc'
  return (
    <svg
      width={10}
      height={10}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`ml-1 flex-shrink-0 transition-colors ${active ? 'text-lime' : 'text-subtle'}`}
    >
      {isUp ? (
        <polyline points="18 15 12 9 6 15" />
      ) : (
        <polyline points="6 9 12 15 18 9" />
      )}
    </svg>
  )
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

export function MaintenanceTable({
  records,
  sortKey,
  sortDir,
  onSort,
  onEdit,
  onDelete,
}: MaintenanceTableProps) {
  return (
    <GlassPanel rounded="rounded-2xl" className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            {COLUMNS.map((col) => (
              <th
                key={col.label}
                onClick={col.key ? () => onSort(col.key!) : undefined}
                className={`px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-muted ${
                  col.key ? 'cursor-pointer select-none hover:text-white' : ''
                }`}
              >
                <span className="inline-flex items-center">
                  {col.label}
                  {col.key && (
                    <SortIcon
                      active={sortKey === col.key}
                      dir={sortKey === col.key ? sortDir : 'desc'}
                    />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr
              key={r.id}
              className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]"
            >
              <td className="px-4 py-3 text-sm text-white">{formatDate(r.serviceDate)}</td>
              <td className="px-4 py-3 text-sm text-white">{r.type}</td>
              <td className="px-4 py-3 text-sm text-muted">{r.shopName ?? '—'}</td>
              <td className="px-4 py-3 font-mono text-sm text-white">{formatMileage(r.mileage)}</td>
              <td className="px-4 py-3 font-mono text-sm text-white">{formatCost(r.cost)}</td>
              <td className="px-4 py-3 text-sm text-muted">{formatDate(r.nextServiceDate)}</td>
              <td className="px-4 py-3">
                <VerifiedBadge verified={r.verified} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(r)}
                    title="Editar"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(r)}
                    title="Eliminar"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassPanel>
  )
}
