import type { ReactNode } from 'react'

export function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-glass backdrop-blur-xl shadow-2xl ${className}`}>
      {children}
    </div>
  )
}
