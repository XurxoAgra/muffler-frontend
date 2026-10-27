import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { MOTION_MS, prefersReducedMotion } from '../../lib/motion'

const PresenceContext = createContext(false)

/**
 * Keeps its last child mounted for one exit animation after the parent stops rendering it,
 * so `{open && <Modal />}` call sites get a real close transition. Descendants read the
 * exiting flag with `usePresenceExiting()`.
 */
export function Presence({ children }: { children: ReactNode }) {
  const present = Boolean(children)
  const [rendered, setRendered] = useState<ReactNode>(children)
  const [exiting, setExiting] = useState(false)

  if (present && rendered !== children) {
    setRendered(children)
    setExiting(false)
  } else if (!present && rendered && !exiting) {
    setExiting(true)
  }

  useEffect(() => {
    if (!exiting) return
    const timeout = window.setTimeout(
      () => {
        setRendered(null)
        setExiting(false)
      },
      prefersReducedMotion() ? 0 : MOTION_MS.base,
    )
    return () => window.clearTimeout(timeout)
  }, [exiting])

  return <PresenceContext value={exiting}>{rendered}</PresenceContext>
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook is colocated with its provider by convention in this codebase
export function usePresenceExiting() {
  return useContext(PresenceContext)
}
