import { useId, type InputHTMLAttributes } from 'react'

interface UnderlineInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function UnderlineInput({ label, error, id, className = '', ...props }: UnderlineInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full border-0 border-b border-white/12 bg-transparent py-2 text-white outline-none transition-colors placeholder:text-muted focus:border-lime ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
