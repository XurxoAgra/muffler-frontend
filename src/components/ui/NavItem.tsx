import type { ReactNode } from 'react'

interface NavItemProps {
  icon: ReactNode
  label: string
  active?: boolean
  disabled?: boolean
  collapsed?: boolean
  badge?: ReactNode
  badgeTone?: 'accent' | 'danger'
  onClick?: () => void
}

export function NavItem({
  icon,
  label,
  active = false,
  disabled = false,
  collapsed = false,
  badge,
  badgeTone = 'accent',
  onClick,
}: NavItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`relative flex w-full items-center rounded-lg transition-colors ${
        collapsed ? 'justify-center px-0 py-3' : 'justify-start gap-3 px-3.5 py-2.5'
      } ${
        active
          ? 'bg-lime-10 font-semibold text-lime'
          : disabled
            ? 'cursor-default text-subtle'
            : 'text-muted hover:bg-white/5 hover:text-white'
      }`}
    >
      {active && (
        <span className="absolute bottom-1/4 left-0 top-1/4 w-0.5 rounded bg-lime shadow-[0_0_8px_var(--color-lime)]" />
      )}
      <span className="flex-shrink-0">{icon}</span>
      <span
        className={`overflow-hidden whitespace-nowrap text-sm transition-all ${
          collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
        }`}
      >
        {label}
      </span>
      {badge !== undefined && !collapsed && (
        <span
          className={`ml-auto flex-shrink-0 rounded-lg px-1.5 py-0.5 font-mono text-[10px] font-bold ${
            badgeTone === 'danger' ? 'bg-danger text-white' : 'bg-lime text-black'
          }`}
        >
          {badge}
        </span>
      )}
      {active && !collapsed && badge === undefined && (
        <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-lime shadow-[0_0_8px_var(--color-lime)]" />
      )}
    </button>
  )
}
