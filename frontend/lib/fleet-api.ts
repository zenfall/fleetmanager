'use client'

import { api } from './api-client'
import {
  User, CreateUserInput, UpdateUserInput,
  Driver, Vehicle, Assignment,
  Payment, OilChange, GPSRecharge, Expense
} from './types'

/**
 * Couche d'acces aux donnees : remplace l'ancien lib/store.ts (localStorage) par des
 * appels au backend Spring Boot. Les fonctions traduisent les DTO backend vers les
 * types frontend existants pour limiter l'impact sur les composants.
 */

// ---------- Users ----------
export const getUsers = () => api.get<User[]>('/api/users')
export const addUser = (data: CreateUserInput) => api.post<User>('/api/users', data)
export const updateUser = (id: string, data: UpdateUserInput) => api.put<User>(`/api/users/${id}`, data)
export const deleteUser = (id: string) => api.delete<void>(`/api/users/${id}`)

// ---------- Drivers ----------
export const getDrivers = () => api.get<Driver[]>('/api/drivers')
export const addDriver = (data: Omit<Driver, 'id' | 'createdAt'>) => api.post<Driver>('/api/drivers', data)
export const updateDriver = (id: string, data: Partial<Driver>) => api.put<Driver>(`/api/drivers/${id}`, data)
export const deleteDriver = (id: string) => api.delete<void>(`/api/drivers/${id}`)

// ---------- Vehicles ----------
interface VehicleDto {
  id: string
  name: string
  plate: string
  currentDriverId?: string
  currentDriverName?: string
  status: Vehicle['status']
  gpsExpiryDate?: string
  createdAt: string
}

function toVehicle(dto: VehicleDto): Vehicle {
  return {
    id: dto.id,
    name: dto.name,
    plate: dto.plate,
    driver: dto.currentDriverName || '',
    currentDriverId: dto.currentDriverId,
    status: dto.status,
    createdAt: dto.createdAt,
    gpsExpiryDate: dto.gpsExpiryDate
  }
}

export const getVehicles = async (): Promise<Vehicle[]> => {
  const dtos = await api.get<VehicleDto[]>('/api/vehicles')
  return dtos.map(toVehicle)
}

export const addVehicle = async (data: Omit<Vehicle, 'id' | 'createdAt'>): Promise<Vehicle> => {
  const dto = await api.post<VehicleDto>('/api/vehicles', {
    name: data.name,
    plate: data.plate,
    status: data.status,
    gpsExpiryDate: data.gpsExpiryDate
  })
  return toVehicle(dto)
}

export const updateVehicle = async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
  const dto = await api.put<VehicleDto>(`/api/vehicles/${id}`, {
    name: data.name,
    plate: data.plate,
    status: data.status,
    gpsExpiryDate: data.gpsExpiryDate
  })
  return toVehicle(dto)
}

export const deleteVehicle = (id: string) => api.delete<void>(`/api/vehicles/${id}`)

// ---------- Assignments ----------
interface AssignmentDto {
  id: string
  vehicleId: string
  vehicleName: string
  driverId: string
  driverName: string
  startDate: string
  endDate?: string
  note?: string
}

function toAssignment(dto: AssignmentDto): Assignment {
  return {
    id: dto.id,
    vehicleId: dto.vehicleId,
    driverId: dto.driverId,
    startDate: dto.startDate,
    endDate: dto.endDate,
    note: dto.note
  }
}

export const getAssignments = async (): Promise<Assignment[]> => {
  const dtos = await api.get<AssignmentDto[]>('/api/assignments')
  return dtos.map(toAssignment)
}

export const getAssignmentsByVehicle = async (vehicleId: string): Promise<Assignment[]> => {
  const dtos = await api.get<AssignmentDto[]>(`/api/assignments/vehicle/${vehicleId}`)
  return dtos.map(toAssignment)
}

export const getAssignmentsByDriver = async (driverId: string): Promise<Assignment[]> => {
  const dtos = await api.get<AssignmentDto[]>(`/api/assignments/driver/${driverId}`)
  return dtos.map(toAssignment)
}

export const assignDriver = async (vehicleId: string, driverId: string, startDate?: string, note?: string): Promise<Assignment> => {
  const dto = await api.post<AssignmentDto>('/api/assignments', { vehicleId, driverId, startDate, note })
  return toAssignment(dto)
}

export const endAssignment = (vehicleId: string, endDate?: string) => {
  const query = endDate ? `?endDate=${endDate}` : ''
  return api.post<void>(`/api/assignments/vehicle/${vehicleId}/end${query}`)
}

// ---------- Payments ----------
export const getPayments = () => api.get<Payment[]>('/api/payments')
export const addPayment = (data: Omit<Payment, 'id'>) => api.post<Payment>('/api/payments', data)
export const updatePayment = (id: string, data: Partial<Payment>) => api.put<Payment>(`/api/payments/${id}`, data)
export const deletePayment = (id: string) => api.delete<void>(`/api/payments/${id}`)

// ---------- Oil changes ----------
export const getOilChanges = () => api.get<OilChange[]>('/api/oil-changes')
export const addOilChange = (data: Omit<OilChange, 'id'>) => api.post<OilChange>('/api/oil-changes', data)
export const updateOilChange = (id: string, data: Partial<OilChange>) => api.put<OilChange>(`/api/oil-changes/${id}`, data)
export const deleteOilChange = (id: string) => api.delete<void>(`/api/oil-changes/${id}`)

// ---------- GPS recharges ----------
export const getGPSRecharges = () => api.get<GPSRecharge[]>('/api/gps-recharges')
export const addGPSRecharge = (data: Omit<GPSRecharge, 'id'>) => api.post<GPSRecharge>('/api/gps-recharges', data)
export const updateGPSRecharge = (id: string, data: Partial<GPSRecharge>) => api.put<GPSRecharge>(`/api/gps-recharges/${id}`, data)
export const deleteGPSRecharge = (id: string) => api.delete<void>(`/api/gps-recharges/${id}`)

// ---------- Expenses ----------
export const getExpenses = () => api.get<Expense[]>('/api/expenses')
export const addExpense = (data: Omit<Expense, 'id'>) => api.post<Expense>('/api/expenses', data)
export const updateExpense = (id: string, data: Partial<Expense>) => api.put<Expense>(`/api/expenses/${id}`, data)
export const deleteExpense = (id: string) => api.delete<void>(`/api/expenses/${id}`)

// ---------- Vue 360 (operations transversales) ----------
export interface OperationFilters {
  dateFrom?: string
  dateTo?: string
  vehicleId?: string
  driverId?: string
  type?: 'payment' | 'oilChange' | 'gps' | 'expense'
}

function buildQuery(filters: OperationFilters = {}): string {
  const params = new URLSearchParams()
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.vehicleId) params.set('vehicleId', filters.vehicleId)
  if (filters.driverId) params.set('driverId', filters.driverId)
  if (filters.type) params.set('type', filters.type)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

/** Vue 360 : toutes les saisies pour SUPERVISEUR/ADMIN, saisies propres pour un AGENT (regle appliquee cote backend). */
export const getOperations360 = (filters?: OperationFilters) =>
  api.get<import('./types').OperationItem[]>(`/api/operations${buildQuery(filters)}`)

/** Alertes calculees cote backend (vidange a prevoir, expiration GPS). */
export const getAlerts = () => api.get<import('./types').Alert[]>('/api/alerts')

export interface DashboardStats {
  totalVehicles: number
  activeVehicles: number
  maintenanceVehicles: number
  totalDrivers: number
  activeDrivers: number
  totalIncome: number
  totalExpenses: number
  balance: number
  alertsCount: number
}

export const getDashboardStats = () => api.get<DashboardStats>('/api/dashboard/stats')
