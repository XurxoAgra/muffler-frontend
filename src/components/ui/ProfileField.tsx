import type { ReactNode } from 'react'

interface ProfileFieldProps {
  label: string
  value?: string
  mono?: boolean
  editable?: boolean
  badge?: ReactNode
}

export function ProfileField({ label, value, mono = false, editable = false, badge }: ProfileFieldProps) {
  return (
    <div className="grid grid-cols-[120px_1fr_auto] items-center gap-4 border-b border-white/5 py-4 last:border-0 sm:grid-cols-[150px_1fr_auto]">
      <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted">{label}</span>

      {badge ?? <span className={mono ? 'font-mono text-[13px] tracking-wide text-white' : 'text-sm text-white'}>{value}</span>}

      {editable ? (
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 text-[11px] font-medium text-subtle disabled:cursor-not-allowed"
        >
          <EditIcon /> Edit
        </button>
      ) : (
        <span />
      )}
    </div>
  )
}

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
