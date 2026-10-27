import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from './motion'

const COUNT_UP_MS = 800

/**
 * Animates a number from 0 on mount, and from the previous value when it changes.
 * Returns the raw interpolated value; rounding and formatting stay with the caller.
 */
export function useCountUp(target: number, delay = 0) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0))
  const shownRef = useRef(value)

  useEffect(() => {
    const from = shownRef.current
    let frame = 0
    let start: number | null = null

    const tick = (now: number) => {
      start ??= now
      const progress = prefersReducedMotion() ? 1 : Math.min((now - start) / COUNT_UP_MS, 1)
      const next = from + (target - from) * (1 - Math.pow(1 - progress, 3))
      shownRef.current = next
      setValue(next)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    const timeout = window.setTimeout(() => {
      frame = requestAnimationFrame(tick)
    }, delay)

    return () => {
      window.clearTimeout(timeout)
      cancelAnimationFrame(frame)
    }
  }, [target, delay])

  return value
}
