export type VehicleTypeValue = 'car' | 'moto' | 'van' | 'truck'

export const VEHICLE_TYPES = [
  { value: 'car', label: 'Coche' },
  { value: 'moto', label: 'Moto' },
  { value: 'van', label: 'Furgoneta' },
  { value: 'truck', label: 'Camión' },
] as const satisfies ReadonlyArray<{ value: VehicleTypeValue; label: string }>
