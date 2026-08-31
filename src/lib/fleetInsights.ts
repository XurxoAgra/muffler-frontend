import { getVehicleTint } from '../constants/vehicleTints'
import type { MaintenanceRecord, Vehicle } from './types'

export type ReviewStatus = 'vencida' | 'proxima' | 'programada'

export interface UpcomingItem {
  vehicleId: string
  vehicleLabel: string
  type: string
  date: string
  status: ReviewStatus
}

export interface MileageBubble {
  vehicleId: string
  label: string
  km: number
  sizePx: number
  fontSizePx: number
  tint: string
}

export interface MonthlyTotal {
  month: number
  total: number
}

export interface VehicleSpend {
  vehicleId: string
  label: string
  total: number
  tint: string
  barPct: number
}

const DAY_MS = 86400000

export function getVehicleLabel(vehicle: Vehicle): string {
  const make = vehicle.custom_make ?? vehicle.make?.name ?? ''
  const model = vehicle.custom_model ?? vehicle.model?.name ?? ''
  return [make, model].filter(Boolean).join(' ')
}

export function getVehicleTotal(records: MaintenanceRecord[]): number {
  return records.reduce((sum, r) => sum + (r.cost ? parseFloat(r.cost) : 0), 0)
}

export function getCurrentMileage(records: MaintenanceRecord[]): number | null {
  const withMileage = records.filter((r): r is MaintenanceRecord & { mileage: number } => r.mileage !== null)
  if (withMileage.length === 0) return null
  return Math.max(...withMileage.map((r) => r.mileage))
}

export function deriveReviewStatus(dateIso: string, today: Date): ReviewStatus {
  const days = Math.round((new Date(dateIso).getTime() - today.getTime()) / DAY_MS)
  if (days < 0) return 'vencida'
  if (days <= 14) return 'proxima'
  return 'programada'
}

export function deriveUpcoming(
  vehicles: Vehicle[],
  recordsByVehicle: Record<string, MaintenanceRecord[]>,
  today: Date = new Date(),
): UpcomingItem[] {
  const items: UpcomingItem[] = []
  for (const vehicle of vehicles) {
    const records = recordsByVehicle[vehicle.id] ?? []
    const withNext = records.filter((r) => r.nextServiceDate)
    if (withNext.length === 0) continue
    const latest = withNext.reduce((a, b) => (new Date(a.nextServiceDate!) < new Date(b.nextServiceDate!) ? a : b))
    items.push({
      vehicleId: vehicle.id,
      vehicleLabel: getVehicleLabel(vehicle),
      type: latest.type,
      date: latest.nextServiceDate!,
      status: deriveReviewStatus(latest.nextServiceDate!, today),
    })
  }
  return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function countOverdue(upcoming: UpcomingItem[]): number {
  return upcoming.filter((u) => u.status === 'vencida').length
}

export function computeMileageBubbles(
  vehicles: Vehicle[],
  recordsByVehicle: Record<string, MaintenanceRecord[]>,
): MileageBubble[] {
  const withMileage = vehicles
    .map((vehicle, index) => ({ vehicle, index, km: getCurrentMileage(recordsByVehicle[vehicle.id] ?? []) }))
    .filter((x): x is { vehicle: Vehicle; index: number; km: number } => x.km !== null)

  if (withMileage.length === 0) return []
  const max = Math.max(...withMileage.map((x) => x.km))

  return withMileage.map(({ vehicle, index, km }) => ({
    vehicleId: vehicle.id,
    label: [vehicle.plate, getVehicleLabel(vehicle)].filter(Boolean).join(' · '),
    km,
    sizePx: 70 + Math.round((km / max) * 60),
    fontSizePx: 14 + Math.round((km / max) * 4),
    tint: getVehicleTint(index),
  }))
}

export function computeAvgCost(recordsByVehicle: Record<string, MaintenanceRecord[]>): { avg: number; count: number } {
  const all = Object.values(recordsByVehicle).flat()
  const total = all.reduce((s, r) => s + (r.cost ? parseFloat(r.cost) : 0), 0)
  return { avg: all.length ? Math.round(total / all.length) : 0, count: all.length }
}

export function computeMaintenanceIndexPct(vehicles: Vehicle[], upcoming: UpcomingItem[]): number {
  if (vehicles.length === 0) return 100
  const overdueVehicleIds = new Set(upcoming.filter((u) => u.status === 'vencida').map((u) => u.vehicleId))
  return Math.round(((vehicles.length - overdueVehicleIds.size) / vehicles.length) * 100)
}

export function computeMonthlyTotals(recordsByVehicle: Record<string, MaintenanceRecord[]>): MonthlyTotal[] {
  const totals = new Array(12).fill(0) as number[]
  for (const records of Object.values(recordsByVehicle)) {
    for (const r of records) {
      if (!r.cost) continue
      const month = new Date(r.serviceDate).getMonth()
      totals[month] += parseFloat(r.cost)
    }
  }
  return totals.map((total, month) => ({ month, total }))
}

export function computeSpendByVehicle(
  vehicles: Vehicle[],
  recordsByVehicle: Record<string, MaintenanceRecord[]>,
): VehicleSpend[] {
  const totals = vehicles.map((vehicle, index) => ({
    vehicle,
    total: getVehicleTotal(recordsByVehicle[vehicle.id] ?? []),
    tint: getVehicleTint(index),
  }))
  const max = Math.max(...totals.map((t) => t.total), 1)

  return totals.map(({ vehicle, total, tint }) => ({
    vehicleId: vehicle.id,
    label: [vehicle.plate, getVehicleLabel(vehicle)].filter(Boolean).join(' · '),
    total,
    tint,
    barPct: Math.round((total / max) * 100),
  }))
}

export function computeGlobalTotal(recordsByVehicle: Record<string, MaintenanceRecord[]>): number {
  return Object.values(recordsByVehicle).flat().reduce((s, r) => s + (r.cost ? parseFloat(r.cost) : 0), 0)
}
