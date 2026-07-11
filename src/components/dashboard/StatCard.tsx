import type { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  title: string
  value: ReactNode
  aside?: ReactNode
}

export function StatCard({ icon, title, value, aside }: StatCardProps) {
  return (
    <div className="flex items-center justify-between rounded-[20px] bg-surface p-5 shadow-sm">
      <div>
        <div className="mb-1.5 flex items-center gap-1.5 text-text-secondary">
          {icon}
          <span className="font-display text-xs font-bold text-text-primary">{title}</span>
        </div>
        <div className="font-display text-lg font-extrabold text-text-primary">{value}</div>
      </div>
      {aside}
    </div>
  )
}
