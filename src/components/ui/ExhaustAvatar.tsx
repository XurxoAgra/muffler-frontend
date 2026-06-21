interface ExhaustAvatarProps {
  size?: number
}

export function ExhaustAvatar({ size = 84 }: ExhaustAvatarProps) {
  const inner = size * 0.72

  return (
    <div
      className="flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-lime-20 bg-lime-6"
      style={{ width: size, height: size }}
    >
      <svg width={inner} height={inner} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="17" r="9" className="fill-lime" opacity="0.12" />
        <circle cx="24" cy="17" r="9" fill="none" className="stroke-lime" strokeWidth="1.5" opacity="0.75" />
        <circle cx="20.5" cy="16" r="1.3" className="fill-lime" opacity="0.65" />
        <circle cx="27.5" cy="16" r="1.3" className="fill-lime" opacity="0.65" />
        <path d="M20.5 20.5 Q24 23.5 27.5 20.5" className="stroke-lime" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.65" />
        <path d="M7 44 C7 33 15 29 24 29 C33 29 41 33 41 44" className="fill-lime" opacity="0.08" />
        <path
          d="M7 44 C7 33 15 29 24 29 C33 29 41 33 41 44"
          className="stroke-lime"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />
      </svg>
    </div>
  )
}
