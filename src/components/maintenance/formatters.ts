export function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES')
}

export function formatMileage(n: number | null): string {
  if (n === null) return '—'
  return `${n.toLocaleString('es-ES')} km`
}

export function formatCost(c: string | null): string {
  if (!c) return '—'
  return `${parseFloat(c).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`
}
