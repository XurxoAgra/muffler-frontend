import { useTranslation } from 'react-i18next'

interface LanguageSwitcherProps {
  collapsed?: boolean
}

export function LanguageSwitcher({ collapsed = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const current = i18n.language.startsWith('en') ? 'en' : 'es'

  function toggle() {
    void i18n.changeLanguage(current === 'es' ? 'en' : 'es')
  }

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={toggle}
        title={current === 'es' ? 'Switch to English' : 'Cambiar a español'}
        className="flex w-full items-center justify-center rounded-lg px-0 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted transition-colors hover:bg-white/5 hover:text-white"
      >
        {current.toUpperCase()}
      </button>
    )
  }

  return (
    <div className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-subtle">Lang</span>
      <div className="flex rounded-full border border-white/10 bg-white/[0.03] p-0.5">
        {(['es', 'en'] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => void i18n.changeLanguage(lang)}
            className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest transition-colors ${
              current === lang ? 'bg-white text-black' : 'text-muted hover:text-white'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  )
}
