interface PillTabsProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function PillTabs<T extends string>({ options, value, onChange, className = '' }: PillTabsProps<T>) {
  return (
    <div className={`inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1 ${className}`}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-5 py-2 font-display text-sm font-medium transition-colors ${
              active ? 'bg-lime text-black' : 'text-white/70 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
