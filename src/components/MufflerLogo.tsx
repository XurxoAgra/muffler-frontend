import type { CSSProperties } from 'react'

type Theme = 'dark' | 'light'

interface MufflerLogoProps {
  /** Lado del icono en px. El texto escala en proporción. */
  size?: number
  /** 'full' = icono + texto, 'icon' = solo icono. */
  variant?: 'full' | 'icon'
  /** Tema actual de la app (para el toggle Dark/Light). */
  theme?: Theme
  /** Muestra la etiqueta de versión junto al texto (p. ej. "v0.1"). */
  version?: string
  className?: string
  style?: CSSProperties
}

interface MufflerIconProps {
  size?: number
  theme?: Theme
  className?: string
  style?: CSSProperties
  /** Accessible name. Pass '' when visible text already names the logo, so it is hidden from assistive tech. */
  title?: string
}

interface Palette {
  tile: string
  wave: string
  text: string
  tag: string
  tagBorder: string
}

const PALETTE: Record<Theme, Palette> = {
  dark: {
    tile: '#C8FF3D',
    wave: '#070A08',
    text: '#EDEFE7',
    tag: '#C8FF3D',
    tagBorder: 'rgba(200,255,61,0.35)',
  },
  light: {
    tile: '#141A0F',
    wave: '#C8FF3D',
    text: '#141A0F',
    tag: '#2D7A00',
    tagBorder: 'rgba(45,122,0,0.35)',
  },
}

/**
 * La onda se simplifica en tamaños pequeños para que siga leyéndose:
 * menos oscilaciones y trazo más grueso.
 */
function wavePath(size: number): { d: string; stroke: number } {
  if (size <= 18) {
    return { d: 'M8 32 Q12 2 16 32 Q20 54 24 32 L56 32', stroke: 8 }
  }
  if (size <= 28) {
    return { d: 'M8 32 Q11 4 14 32 Q17 51 20 32 Q23 20 26 32 Q29 40 32 32 L56 32', stroke: 6 }
  }
  return {
    d: 'M8 32 Q11 4 14 32 Q17 51 20 32 Q23 20 26 32 Q29 40 32 32 Q35 27 38 32 Q41 35 44 32 Q47 30.4 50 32 L56 32',
    stroke: size <= 44 ? 5 : 4,
  }
}

export function MufflerIcon({ size = 32, theme = 'dark', className, style, title = 'Muffler' }: MufflerIconProps) {
  const c = PALETTE[theme]
  const { d, stroke } = wavePath(size)
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      {...a11y}
      className={className}
      style={{ flexShrink: 0, display: 'block', ...style }}
    >
      <rect width="64" height="64" rx="16" fill={c.tile} />
      <path d={d} fill="none" stroke={c.wave} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MufflerLogo({ size = 32, variant = 'full', theme = 'dark', version, className, style }: MufflerLogoProps) {
  const c = PALETTE[theme]

  if (variant === 'icon') {
    return <MufflerIcon size={size} theme={theme} className={className} style={style} />
  }

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.375, ...style }}>
      <MufflerIcon size={size} theme={theme} title="" />
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: size * 0.8,
          letterSpacing: '-0.045em',
          lineHeight: 1,
          color: c.text,
        }}
      >
        muffler
      </span>
      {version && (
        <span
          style={{
            alignSelf: 'flex-start',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: Math.max(9, size * 0.3),
            letterSpacing: '0.12em',
            color: c.tag,
            border: `1px solid ${c.tagBorder}`,
            borderRadius: 999,
            padding: '2px 7px',
          }}
        >
          {version}
        </span>
      )}
    </span>
  )
}
