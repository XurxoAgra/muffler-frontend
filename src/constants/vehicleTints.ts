export const VEHICLE_TINTS = ['#D7F24C', '#C9B8F5', '#8FBE82', '#F5C97A', '#7EC8E3', '#F0A6A6'] as const

export function getVehicleTint(index: number): string {
  return VEHICLE_TINTS[index % VEHICLE_TINTS.length]
}
