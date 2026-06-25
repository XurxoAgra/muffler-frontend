interface VerifiedBadgeProps {
  verified: boolean
}

export function VerifiedBadge({ verified }: VerifiedBadgeProps) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-20 bg-lime-10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-lime">
        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-lime" />
        Verificado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff9f0a38] bg-[#ff9f0a1a] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-[#ff9f0a]">
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#ff9f0a]" />
      Pendiente
    </span>
  )
}
