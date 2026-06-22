interface RoleStyle {
  bg: string
  text: string
  border: string
  dot: string
}

const ROLE_STYLES: Record<string, RoleStyle> = {
  admin: { bg: 'bg-lime-10', text: 'text-lime', border: 'border-lime-20', dot: 'bg-lime' },
  owner: { bg: 'bg-lime-10', text: 'text-lime', border: 'border-lime-20', dot: 'bg-lime' },
  editor: { bg: 'bg-[#78a0ff1a]', text: 'text-[#8aabff]', border: 'border-[#78a0ff38]', dot: 'bg-[#8aabff]' },
}

const DEFAULT_STYLE: RoleStyle = { bg: 'bg-white/5', text: 'text-muted', border: 'border-white/10', dot: 'bg-muted' }

interface RoleBadgeProps {
  role: string
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const key = role.toLowerCase().replace(/^role_/, '')
  const style = ROLE_STYLES[key] ?? DEFAULT_STYLE

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest ${style.bg} ${style.text} ${style.border}`}
    >
      <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${style.dot}`} />
      {role}
    </span>
  )
}
