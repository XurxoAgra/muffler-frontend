import { useTranslation } from 'react-i18next'

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton rounded-[20px] ${className}`} />
}

interface PageSkeletonProps {
  variant?: 'panels' | 'cards'
}

/** Page-level loading placeholder. It fades in after a short delay so fast loads never flash it. */
export function PageSkeleton({ variant = 'panels' }: PageSkeletonProps) {
  const { t } = useTranslation()

  return (
    <div role="status" className="animate-fade-in [animation-delay:150ms]">
      <span className="sr-only">{t('common.loading')}</span>
      {variant === 'cards' ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          <Skeleton className="h-[190px]" />
          <Skeleton className="h-[190px]" />
          <Skeleton className="h-[190px]" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
          </div>
          <Skeleton className="h-[220px]" />
        </div>
      )}
    </div>
  )
}
