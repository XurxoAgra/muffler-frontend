import type { ReactNode } from 'react'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  rounded?: string
}

export function GlassPanel({ children, className = '', rounded = 'rounded-3xl' }: GlassPanelProps) {
  return (
    <div className={`${rounded} border border-white/10 bg-glass backdrop-blur-xl shadow-2xl ${className}`}>
      {children}
    </div>
  )
}
