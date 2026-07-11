export type VehicleTypeValue = 'car' | 'moto' | 'van' | 'truck'

export const VEHICLE_TYPES = ['car', 'moto', 'van', 'truck'] as const satisfies ReadonlyArray<VehicleTypeValue>
