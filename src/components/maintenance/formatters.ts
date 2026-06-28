import i18next from 'i18next'

function locale(): string {
  return i18next.language === 'en' ? 'en-GB' : 'es-ES'
}

export function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(locale())
}

export function formatMileage(n: number | null): string {
  if (n === null) return '—'
  return `${n.toLocaleString(locale())} km`
}

export function formatCost(c: string | null): string {
  if (!c) return '—'
  return `${parseFloat(c).toLocaleString(locale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`
}
