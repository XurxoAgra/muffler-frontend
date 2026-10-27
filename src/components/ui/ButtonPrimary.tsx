import type { ButtonHTMLAttributes } from 'react'

export function ButtonPrimary({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`w-full rounded-full bg-lime px-6 py-3 font-display font-semibold text-black pressable disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
