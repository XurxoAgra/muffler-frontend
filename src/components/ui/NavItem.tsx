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

/**
 * Sidebar row text. It stays laid out while collapsed (the sidebar clips it) and only fades,
 * so the icons never shift sideways during the width transition. On expand it waits a beat
 * for the sidebar to open up before fading in.
 */
export function NavLabel({ collapsed, className = '', children }: { collapsed: boolean; className?: string; children: ReactNode }) {
  return (
    <span
      className={`whitespace-nowrap transition-[opacity,translate] ${
        collapsed ? '-translate-x-1 opacity-0 duration-(--motion-fast)' : 'translate-x-0 opacity-100 delay-[80ms]'
      } ${className}`}
    >
      {children}
    </span>
  )
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
      aria-current={active ? 'page' : undefined}
      className={`relative flex w-full items-center gap-3 rounded-lg py-2.5 pl-[15px] pr-3.5 transition-colors ${
        active
          ? 'bg-lime-10 font-semibold text-lime'
          : disabled
            ? 'cursor-default text-subtle'
            : 'cursor-pointer text-muted hover:bg-shell-fg/5 hover:text-shell-fg-hover'
      }`}
    >
      <span
        className={`absolute bottom-1/4 left-0 top-1/4 w-0.5 rounded bg-lime shadow-[0_0_8px_var(--color-lime)] transition-[opacity,scale] ${
          active ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
        }`}
      />
      <span className="flex-shrink-0">{icon}</span>
      <NavLabel collapsed={collapsed} className="text-sm">
        {label}
      </NavLabel>
      {badge !== undefined && (
        <NavLabel
          collapsed={collapsed}
          className={`ml-auto flex-shrink-0 rounded-lg px-1.5 py-0.5 font-mono text-[10px] font-bold ${
            badgeTone === 'danger' ? 'bg-danger text-white' : 'bg-lime text-black'
          }`}
        >
          {badge}
        </NavLabel>
      )}
      {active && badge === undefined && (
        <NavLabel
          collapsed={collapsed}
          className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-lime shadow-[0_0_8px_var(--color-lime)]"
        >
          {null}
        </NavLabel>
      )}
    </button>
  )
}
