// Mirrors the motion tokens in src/index.css (@theme). Keep the two in sync.
export const MOTION_MS = {
  fast: 150,
  base: 220,
  slow: 320,
}

export const STAGGER_MS = 50

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
