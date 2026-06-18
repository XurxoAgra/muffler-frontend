export function SignalMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`h-4 w-4 ${className}`} fill="none" aria-hidden="true">
      <rect x="1" y="6" width="2" height="4" rx="1" fill="currentColor" />
      <rect x="5" y="3" width="2" height="10" rx="1" fill="currentColor" />
      <rect x="9" y="0" width="2" height="16" rx="1" fill="currentColor" />
      <rect x="13" y="4" width="2" height="8" rx="1" fill="currentColor" />
    </svg>
  )
}
