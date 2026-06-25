import { useEffect, type ReactNode } from 'react'
import { GlassPanel } from './GlassPanel'

interface ModalProps {
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Modal({ onClose, children, className = '' }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <GlassPanel rounded="rounded-2xl" className={`relative z-10 w-full max-w-md p-6 ${className}`}>
        {children}
      </GlassPanel>
    </div>
  )
}
