import type { ButtonHTMLAttributes } from 'react'

export function ButtonGlass({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-3 font-body text-sm text-white transition-colors hover:bg-white/10 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
