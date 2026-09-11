import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GlassPanel } from '../ui/GlassPanel'
import { VerifiedBadge } from './VerifiedBadge'
import { formatDate, formatMileage, formatCost } from './formatters'
import { useMaintenanceRecordTypes } from '../../maintenance/useMaintenanceRecordTypes'
import type { MaintenanceRecord } from '../../lib/types'

export type SortKey = 'serviceDate' | 'maintenanceRecordType' | 'mileage' | 'cost' | 'nextServiceDate'

interface MaintenanceTableProps {
  records: MaintenanceRecord[]
  sortKey: SortKey
  sortDir: 'asc' | 'desc'
  onSort: (key: SortKey) => void
  onView: (record: MaintenanceRecord) => void
  onEdit: (record: MaintenanceRecord) => void
  onDelete: (record: MaintenanceRecord) => void
}

type Column = { key: SortKey | null; label: string }

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

function EyeIcon() {
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
      <path d="M1.5 12S5 5.5 12 5.5 22.5 12 22.5 12 19 18.5 12 18.5 1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3.2" />
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
  onView,
  onEdit,
  onDelete,
}: MaintenanceTableProps) {
  const { t } = useTranslation()
  const { labelOf } = useMaintenanceRecordTypes()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function updateScrollState() {
      const { scrollWidth, clientWidth, scrollLeft } = el!
      setCanScrollRight(scrollWidth - clientWidth - scrollLeft > 4)
    }

    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(el)

    return () => {
      el.removeEventListener('scroll', updateScrollState)
      resizeObserver.disconnect()
    }
  }, [records])

  const COLUMNS: Column[] = [
    { key: 'serviceDate', label: t('maintenance.table.date') },
    { key: 'maintenanceRecordType', label: t('maintenance.table.type') },
    { key: null, label: t('maintenance.table.shop') },
    { key: 'mileage', label: t('maintenance.table.km') },
    { key: 'cost', label: t('maintenance.table.cost') },
    { key: 'nextServiceDate', label: t('maintenance.table.nextService') },
    { key: null, label: t('maintenance.table.verified') },
    { key: null, label: t('maintenance.table.actions') },
  ]

  return (
    <GlassPanel rounded="rounded-2xl" className="relative overflow-hidden">
      <div
        ref={scrollRef}
        className="overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] [scrollbar-color:var(--color-border-soft)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--color-border-soft)]"
      >
        <table className="w-full min-w-[920px]">
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
                <td className="px-4 py-3 text-sm text-white">
                  {labelOf(r.maintenanceRecordTypeId) ?? '—'}
                </td>
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
                      onClick={() => onView(r)}
                      title={t('maintenance.viewTitle')}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <EyeIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(r)}
                      title={t('maintenance.editTitle')}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(r)}
                      title={t('maintenance.deleteTitle')}
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
      </div>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-glass to-transparent transition-opacity duration-200 ${
          canScrollRight ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </GlassPanel>
  )
}
