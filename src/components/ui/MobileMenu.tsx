import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { MufflerIcon } from '../MufflerLogo'
import { HeaderActions } from '../layout/HeaderActions'

export interface MenuItem {
  path: string
  label: string
  icon: ReactNode
  active: boolean
  badge?: number
  badgeTone?: 'accent' | 'danger'
}

interface MobileMenuProps {
  items: MenuItem[]
  onNavigate: (path: string) => void
  onLogout: () => void
  loggingOut: boolean
}

// Tailwind's `lg` breakpoint: from here up the desktop sidebar takes over.
const DESKTOP_QUERY = '(min-width: 64rem)'

const MOTION = 'duration-(--motion-slow) ease-in-out-soft'

function MenuToggleIcon({ open }: { open: boolean }) {
  const line = `absolute left-0 h-0.5 w-5 rounded-full bg-current transition-[translate,rotate,opacity] ${MOTION}`
  return (
    <span aria-hidden="true" className="relative block h-3.5 w-5">
      <span className={`${line} top-0 ${open ? 'translate-y-1.5 rotate-45' : ''}`} />
      <span className={`${line} top-1.5 ${open ? 'opacity-0' : ''}`} />
      <span className={`${line} top-3 ${open ? '-translate-y-1.5 -rotate-45' : ''}`} />
    </span>
  )
}

export function MobileMenu({ items, onNavigate, onLogout, loggingOut }: MobileMenuProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // The panel goes inert on close, so focus must move out of it before that happens.
  function close() {
    setOpen(false)
    toggleRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    const desktop = window.matchMedia(DESKTOP_QUERY)
    function handleDesktop(e: MediaQueryListEvent) {
      if (e.matches) setOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    desktop.addEventListener('change', handleDesktop)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      desktop.removeEventListener('change', handleDesktop)
    }
  }, [open])

  function handleNavigate(path: string) {
    close()
    onNavigate(path)
  }

  function handleBackdropClick(e: MouseEvent<HTMLDivElement>) {
    if (!(e.target as HTMLElement).closest('button')) close()
  }

  return (
    <>
      <div className="sticky top-2.5 z-50 flex flex-shrink-0 items-center justify-between gap-3 rounded-2xl bg-shell px-2 py-2 text-shell-fg lg:hidden">
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
          onClick={() => (open ? close() : setOpen(true))}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-white/5 hover:text-shell-fg-hover"
        >
          <MenuToggleIcon open={open} />
        </button>
        <div className="flex items-center gap-2.5 pr-1">
          <MufflerIcon size={32} title="" />
          <span className="font-display text-base font-bold">muffler</span>
        </div>
      </div>

      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.menu')}
        tabIndex={-1}
        inert={!open}
        onClick={handleBackdropClick}
        className={`fixed inset-0 z-40 flex flex-col overflow-y-auto bg-shell/95 px-7 pb-10 pt-28 text-shell-fg outline-none backdrop-blur-md transition-opacity lg:hidden ${MOTION} ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <nav aria-label={t('nav.menu')}>
          <ul className="flex flex-col gap-1">
            {items.map((item, i) => (
              <li
                key={item.path}
                style={{ transitionDelay: open ? `${60 + i * 40}ms` : '0ms' }}
                className={`transition-[opacity,translate] ${MOTION} ${open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              >
                <button
                  type="button"
                  aria-current={item.active ? 'page' : undefined}
                  onClick={() => handleNavigate(item.path)}
                  className={`inline-flex items-center gap-3 py-2 text-left font-display text-4xl font-bold tracking-tight transition-colors sm:text-5xl ${
                    item.active ? 'text-lime' : 'text-shell-fg/70 hover:text-lime'
                  }`}
                >
                  {item.label}
                  {item.badge !== undefined && (
                    <span
                      className={`rounded-lg px-1.5 py-0.5 font-mono text-xs font-bold ${
                        item.badgeTone === 'danger' ? 'bg-danger text-white' : 'bg-lime text-black'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div
          style={{ transitionDelay: open ? `${60 + items.length * 40}ms` : '0ms' }}
          className={`mt-auto flex flex-col items-start gap-6 pt-10 transition-[opacity,translate] ${MOTION} ${open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <HeaderActions />
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="rounded-lg py-2 text-lg font-semibold text-danger transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? t('nav.signingOut') : t('nav.signOut')}
          </button>
        </div>
      </div>
    </>
  )
}
