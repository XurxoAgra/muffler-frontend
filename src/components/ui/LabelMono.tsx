import type { ReactNode } from 'react'

export function LabelMono({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`font-mono text-xs uppercase tracking-widest text-muted ${className}`}>{children}</span>
}
