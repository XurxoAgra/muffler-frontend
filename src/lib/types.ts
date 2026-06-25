export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
}

export interface RefreshRequest {
  refresh_token: string
}

export interface LogoutRequest {
  refresh_token: string
}

export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  roles: string[]
  created_at: string
}

export interface ApiErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export interface VehicleCatalogRef {
  id: string
  name: string
}

export interface Vehicle {
  id: string
  plate: string
  year: number
  type: string
  vin: string | null
  make: VehicleCatalogRef | null
  model: VehicleCatalogRef | null
  custom_make: string | null
  custom_model: string | null
  role: 'owner' | 'shared'
}

export interface VehicleInput {
  plate: string
  year: number
  type: string
  vin?: string | null
  makeId?: string | null
  modelId?: string | null
  customMake?: string | null
  customModel?: string | null
}

export interface MaintenanceRecord {
  id: string
  vehicleId: string
  invoiceId: string | null
  createdById: string
  serviceDate: string
  type: string
  mileage: number | null
  cost: string | null
  shopName: string | null
  nextServiceDate: string | null
  notes: string | null
  verified: boolean
  createdAt: string
}

export interface MaintenanceRecordInput {
  serviceDate: string
  type: string
  mileage?: number | null
  cost?: string | null
  shopName?: string | null
  nextServiceDate?: string | null
  notes?: string | null
}
