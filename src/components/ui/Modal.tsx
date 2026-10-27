import { useEffect, type ReactNode } from 'react'
import { GlassPanel } from './GlassPanel'
import { usePresenceExiting } from './Presence'

interface ModalProps {
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Modal({ onClose, children, className = '' }: ModalProps) {
  const exiting = usePresenceExiting()

  useEffect(() => {
    if (exiting) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, exiting])

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${exiting ? 'pointer-events-none' : ''}`}>
      <div className={`absolute inset-0 bg-black/60 ${exiting ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={onClose} />
      <GlassPanel
        rounded="rounded-2xl"
        className={`relative z-10 w-full max-w-md p-6 ${exiting ? 'animate-modal-out' : 'animate-modal-in'} ${className}`}
      >
        {children}
      </GlassPanel>
    </div>
  )
}
