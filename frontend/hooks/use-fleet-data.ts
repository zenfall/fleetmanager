'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import {
  User, CreateUserInput, UpdateUserInput,
  Driver, Vehicle, Assignment,
  Payment, OilChange, GPSRecharge, Expense,
  Alert, OperationItem, expenseCategoryLabels
} from '@/lib/types'
import * as fleetApi from '@/lib/fleet-api'
import { useAuth } from '@/lib/auth-context'
import { ApiError } from '@/lib/api-client'

function handleError(action: string, err: unknown) {
  const message = err instanceof ApiError ? err.message : `Erreur lors de : ${action}`
  toast.error(message)
}

export function useFleetData() {
  const { currentUser, isAuthenticated } = useAuth()

  const [users, setUsers] = useState<User[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [oilChanges, setOilChanges] = useState<OilChange[]>([])
  const [gpsRecharges, setGPSRecharges] = useState<GPSRecharge[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const isAdmin = currentUser?.role === 'ADMIN'
  const canManageFleet = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERVISEUR'

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const [driversData, vehiclesData, assignmentsData, paymentsData, oilChangesData, gpsData, expensesData] =
        await Promise.all([
          fleetApi.getDrivers(),
          fleetApi.getVehicles(),
          fleetApi.getAssignments(),
          fleetApi.getPayments(),
          fleetApi.getOilChanges(),
          fleetApi.getGPSRecharges(),
          fleetApi.getExpenses()
        ])
      setDrivers(driversData)
      setVehicles(vehiclesData)
      setAssignments(assignmentsData)
      setPayments(paymentsData)
      setOilChanges(oilChangesData)
      setGPSRecharges(gpsData)
      setExpenses(expensesData)

      if (isAdmin) {
        setUsers(await fleetApi.getUsers())
      }
    } catch (err) {
      handleError('chargement des donnees', err)
    }
  }, [isAuthenticated, isAdmin])

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    refreshData().finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // ---------- User operations (ADMIN uniquement, applique cote backend) ----------
  const addUser = useCallback(async (data: CreateUserInput) => {
    try {
      await fleetApi.addUser(data)
      await refreshData()
      toast.success('Utilisateur cree')
    } catch (err) {
      handleError('creation utilisateur', err)
    }
  }, [refreshData])

  const updateUser = useCallback(async (id: string, data: UpdateUserInput) => {
    try {
      await fleetApi.updateUser(id, data)
      await refreshData()
      toast.success('Utilisateur mis a jour')
    } catch (err) {
      handleError('mise a jour utilisateur', err)
    }
  }, [refreshData])

  const deleteUser = useCallback(async (id: string) => {
    try {
      await fleetApi.deleteUser(id)
      await refreshData()
      toast.success('Utilisateur supprime')
    } catch (err) {
      handleError('suppression utilisateur', err)
    }
  }, [refreshData])

  // ---------- Vehicle operations ----------
  const addVehicle = useCallback(async (data: Omit<Vehicle, 'id' | 'createdAt'>) => {
    try {
      const v = await fleetApi.addVehicle(data)
      await refreshData()
      toast.success('Vehicule ajoute')
      return v
    } catch (err) {
      handleError('creation vehicule', err)
      return undefined
    }
  }, [refreshData])

  const updateVehicle = useCallback(async (id: string, data: Partial<Vehicle>) => {
    try {
      await fleetApi.updateVehicle(id, data)
      await refreshData()
    } catch (err) {
      handleError('mise a jour vehicule', err)
    }
  }, [refreshData])

  const deleteVehicle = useCallback(async (id: string) => {
    try {
      await fleetApi.deleteVehicle(id)
      await refreshData()
      toast.success('Vehicule supprime')
    } catch (err) {
      handleError('suppression vehicule', err)
    }
  }, [refreshData])

  // ---------- Driver operations ----------
  const addDriver = useCallback(async (data: Omit<Driver, 'id' | 'createdAt'>) => {
    try {
      const d = await fleetApi.addDriver(data)
      await refreshData()
      toast.success('Chauffeur ajoute')
      return d
    } catch (err) {
      handleError('creation chauffeur', err)
      return undefined
    }
  }, [refreshData])

  const updateDriver = useCallback(async (id: string, data: Partial<Driver>) => {
    try {
      await fleetApi.updateDriver(id, data)
      await refreshData()
    } catch (err) {
      handleError('mise a jour chauffeur', err)
    }
  }, [refreshData])

  const deleteDriver = useCallback(async (id: string) => {
    try {
      await fleetApi.deleteDriver(id)
      await refreshData()
      toast.success('Chauffeur supprime')
    } catch (err) {
      handleError('suppression chauffeur', err)
    }
  }, [refreshData])

  // ---------- Assignment operations ----------
  const assignDriver = useCallback(async (vehicleId: string, driverId: string, startDate?: string, note?: string) => {
    try {
      await fleetApi.assignDriver(vehicleId, driverId, startDate, note)
      await refreshData()
      toast.success('Chauffeur affecte')
    } catch (err) {
      handleError('affectation chauffeur', err)
    }
  }, [refreshData])

  const endAssignment = useCallback(async (vehicleId: string, endDate?: string) => {
    try {
      await fleetApi.endAssignment(vehicleId, endDate)
      await refreshData()
    } catch (err) {
      handleError("fin d'affectation", err)
    }
  }, [refreshData])

  // ---------- Payment operations ----------
  const addPayment = useCallback(async (data: Omit<Payment, 'id'>) => {
    try {
      await fleetApi.addPayment(data)
      await refreshData()
      toast.success('Versement enregistre')
    } catch (err) {
      handleError('enregistrement versement', err)
    }
  }, [refreshData])

  const updatePayment = useCallback(async (id: string, data: Partial<Payment>) => {
    try {
      await fleetApi.updatePayment(id, data)
      await refreshData()
    } catch (err) {
      handleError('mise a jour versement', err)
    }
  }, [refreshData])

  const deletePayment = useCallback(async (id: string) => {
    try {
      await fleetApi.deletePayment(id)
      await refreshData()
    } catch (err) {
      handleError('suppression versement', err)
    }
  }, [refreshData])

  // ---------- Oil change operations ----------
  const addOilChange = useCallback(async (data: Omit<OilChange, 'id'>) => {
    try {
      await fleetApi.addOilChange(data)
      await refreshData()
      toast.success('Vidange enregistree')
    } catch (err) {
      handleError('enregistrement vidange', err)
    }
  }, [refreshData])

  const updateOilChange = useCallback(async (id: string, data: Partial<OilChange>) => {
    try {
      await fleetApi.updateOilChange(id, data)
      await refreshData()
    } catch (err) {
      handleError('mise a jour vidange', err)
    }
  }, [refreshData])

  const deleteOilChange = useCallback(async (id: string) => {
    try {
      await fleetApi.deleteOilChange(id)
      await refreshData()
    } catch (err) {
      handleError('suppression vidange', err)
    }
  }, [refreshData])

  // ---------- GPS recharge operations ----------
  const addGPSRecharge = useCallback(async (data: Omit<GPSRecharge, 'id'>) => {
    try {
      await fleetApi.addGPSRecharge(data)
      await refreshData()
      toast.success('Recharge GPS enregistree')
    } catch (err) {
      handleError('enregistrement recharge GPS', err)
    }
  }, [refreshData])

  const updateGPSRecharge = useCallback(async (id: string, data: Partial<GPSRecharge>) => {
    try {
      await fleetApi.updateGPSRecharge(id, data)
      await refreshData()
    } catch (err) {
      handleError('mise a jour recharge GPS', err)
    }
  }, [refreshData])

  const deleteGPSRecharge = useCallback(async (id: string) => {
    try {
      await fleetApi.deleteGPSRecharge(id)
      await refreshData()
    } catch (err) {
      handleError('suppression recharge GPS', err)
    }
  }, [refreshData])

  // ---------- Expense operations ----------
  const addExpense = useCallback(async (data: Omit<Expense, 'id'>) => {
    try {
      await fleetApi.addExpense(data)
      await refreshData()
      toast.success('Depense enregistree')
    } catch (err) {
      handleError('enregistrement depense', err)
    }
  }, [refreshData])

  const updateExpense = useCallback(async (id: string, data: Partial<Expense>) => {
    try {
      await fleetApi.updateExpense(id, data)
      await refreshData()
    } catch (err) {
      handleError('mise a jour depense', err)
    }
  }, [refreshData])

  const deleteExpense = useCallback(async (id: string) => {
    try {
      await fleetApi.deleteExpense(id)
      await refreshData()
    } catch (err) {
      handleError('suppression depense', err)
    }
  }, [refreshData])

  // ---------- Computed values (logique historique conservee, sur donnees API) ----------
  const getVehicleById = useCallback((id: string) => vehicles.find(v => v.id === id), [vehicles])

  const getDriverById = useCallback((id?: string) => {
    if (!id) return undefined
    return drivers.find(d => d.id === id)
  }, [drivers])

  const getDriverName = useCallback((id?: string) => {
    if (!id) return null
    return drivers.find(d => d.id === id)?.name || null
  }, [drivers])

  const resolveDriverId = useCallback((vehicleId: string, date: string, explicitDriverId?: string): string | undefined => {
    if (explicitDriverId) return explicitDriverId
    const time = new Date(date).getTime()
    const match = assignments.find(a => {
      if (a.vehicleId !== vehicleId) return false
      const start = new Date(a.startDate).getTime()
      const end = a.endDate ? new Date(a.endDate).getTime() : Infinity
      return time >= start && time <= end
    })
    return match?.driverId
  }, [assignments])

  const getVehicleAssignments = useCallback((vehicleId: string) => {
    return assignments
      .filter(a => a.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  }, [assignments])

  const getDriverAssignments = useCallback((driverId: string) => {
    return assignments
      .filter(a => a.driverId === driverId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  }, [assignments])

  const getDriverVehicles = useCallback((driverId: string) => {
    const ids = new Set(assignments.filter(a => a.driverId === driverId).map(a => a.vehicleId))
    return vehicles.filter(v => ids.has(v.id))
  }, [assignments, vehicles])

  /** Toutes les operations, fusionnees en un flux unifie ("Vue 360" pour SUPERVISEUR/ADMIN ;
   *  un AGENT ne recoit que ses propres saisies car les endpoints sources sont deja filtres cote backend). */
  const operations = useMemo<OperationItem[]>(() => {
    const items: OperationItem[] = [
      ...payments.map(p => ({
        id: p.id,
        type: 'payment' as const,
        date: p.date,
        vehicleId: p.vehicleId,
        driverId: resolveDriverId(p.vehicleId, p.date, p.driverId),
        amount: p.amount,
        isIncome: true,
        description: p.note || 'Versement'
      })),
      ...oilChanges.map(o => ({
        id: o.id,
        type: 'oilChange' as const,
        date: o.date,
        vehicleId: o.vehicleId,
        driverId: resolveDriverId(o.vehicleId, o.date, o.driverId),
        amount: o.cost,
        isIncome: false,
        description: `Vidange - ${o.mileage.toLocaleString()} km`
      })),
      ...gpsRecharges.map(g => ({
        id: g.id,
        type: 'gps' as const,
        date: g.date,
        vehicleId: g.vehicleId,
        driverId: resolveDriverId(g.vehicleId, g.date, g.driverId),
        amount: g.amount,
        isIncome: false,
        description: g.provider || 'Recharge GPS'
      })),
      ...expenses.map(e => ({
        id: e.id,
        type: 'expense' as const,
        date: e.date,
        vehicleId: e.vehicleId,
        driverId: resolveDriverId(e.vehicleId, e.date, e.driverId),
        amount: e.amount,
        isIncome: false,
        description: `${expenseCategoryLabels[e.category]} - ${e.description}`,
        category: e.category
      }))
    ]
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [payments, oilChanges, gpsRecharges, expenses, resolveDriverId])

  const getVehiclePayments = useCallback((vehicleId: string) => payments.filter(p => p.vehicleId === vehicleId), [payments])
  const getVehicleOilChanges = useCallback((vehicleId: string) => oilChanges.filter(o => o.vehicleId === vehicleId), [oilChanges])
  const getVehicleGPSRecharges = useCallback((vehicleId: string) => gpsRecharges.filter(r => r.vehicleId === vehicleId), [gpsRecharges])
  const getVehicleExpenses = useCallback((vehicleId: string) => expenses.filter(e => e.vehicleId === vehicleId), [expenses])

  const getTotalPayments = useCallback(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments])
  const getTotalExpenses = useCallback(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])

  const getMonthlyPayments = useCallback(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return payments.filter(p => new Date(p.date) >= startOfMonth).reduce((sum, p) => sum + p.amount, 0)
  }, [payments])

  const getMonthlyExpenses = useCallback(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return expenses.filter(e => new Date(e.date) >= startOfMonth).reduce((sum, e) => sum + e.amount, 0)
  }, [expenses])

  // ---------- Alertes (vidange a prevoir, expiration GPS) ----------
  const alerts = useMemo(() => {
    const alertsList: Alert[] = []
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    vehicles.forEach(vehicle => {
      const vehicleGPS = gpsRecharges
        .filter(g => g.vehicleId === vehicle.id && g.expiryDate)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      if (vehicleGPS.length > 0) {
        const latestGPS = vehicleGPS[0]
        if (latestGPS.expiryDate) {
          const expiryDate = new Date(latestGPS.expiryDate)
          if (expiryDate <= now) {
            alertsList.push({ id: `gps-expired-${vehicle.id}`, vehicleId: vehicle.id, vehicleName: vehicle.name, type: 'gps_expiry', message: 'GPS expiré', severity: 'danger', date: latestGPS.expiryDate })
          } else if (expiryDate <= threeDaysFromNow) {
            alertsList.push({ id: `gps-critical-${vehicle.id}`, vehicleId: vehicle.id, vehicleName: vehicle.name, type: 'gps_expiry', message: 'GPS expire dans moins de 3 jours', severity: 'danger', date: latestGPS.expiryDate })
          } else if (expiryDate <= sevenDaysFromNow) {
            alertsList.push({ id: `gps-warning-${vehicle.id}`, vehicleId: vehicle.id, vehicleName: vehicle.name, type: 'gps_expiry', message: 'GPS expire bientôt', severity: 'warning', date: latestGPS.expiryDate })
          }
        }
      }

      const vehicleOilChanges = oilChanges
        .filter(o => o.vehicleId === vehicle.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      if (vehicleOilChanges.length > 0) {
        const lastOilChange = vehicleOilChanges[0]
        if (lastOilChange.nextChangeDate) {
          const nextChangeDate = new Date(lastOilChange.nextChangeDate)
          if (nextChangeDate <= now) {
            alertsList.push({ id: `oil-overdue-${vehicle.id}`, vehicleId: vehicle.id, vehicleName: vehicle.name, type: 'oil_change', message: 'Vidange en retard', severity: 'danger', date: lastOilChange.nextChangeDate })
          } else if (nextChangeDate <= threeDaysFromNow) {
            alertsList.push({ id: `oil-critical-${vehicle.id}`, vehicleId: vehicle.id, vehicleName: vehicle.name, type: 'oil_change', message: 'Vidange dans moins de 3 jours', severity: 'danger', date: lastOilChange.nextChangeDate })
          } else if (nextChangeDate <= sevenDaysFromNow) {
            alertsList.push({ id: `oil-soon-${vehicle.id}`, vehicleId: vehicle.id, vehicleName: vehicle.name, type: 'oil_change', message: 'Vidange prévue bientôt', severity: 'warning', date: lastOilChange.nextChangeDate })
          }
        }
      }
    })

    return alertsList.sort((a, b) => {
      if (a.severity === 'danger' && b.severity !== 'danger') return -1
      if (a.severity !== 'danger' && b.severity === 'danger') return 1
      return 0
    })
  }, [vehicles, oilChanges, gpsRecharges])

  return {
    // Data
    users,
    currentUser,
    drivers,
    vehicles,
    assignments,
    payments,
    oilChanges,
    gpsRecharges,
    expenses,
    operations,
    alerts,
    isLoading,
    isAdmin,
    canManageFleet,

    // User operations (ADMIN)
    addUser,
    updateUser,
    deleteUser,

    // Driver operations
    addDriver,
    updateDriver,
    deleteDriver,

    // Assignment operations
    assignDriver,
    endAssignment,

    // Vehicle operations
    addVehicle,
    updateVehicle,
    deleteVehicle,

    // Payment operations
    addPayment,
    updatePayment,
    deletePayment,

    // Oil change operations
    addOilChange,
    updateOilChange,
    deleteOilChange,

    // GPS recharge operations
    addGPSRecharge,
    updateGPSRecharge,
    deleteGPSRecharge,

    // Expense operations
    addExpense,
    updateExpense,
    deleteExpense,

    // Getters
    getVehicleById,
    getDriverById,
    getDriverName,
    getVehicleAssignments,
    getDriverAssignments,
    getDriverVehicles,
    getVehiclePayments,
    getVehicleOilChanges,
    getVehicleGPSRecharges,
    getVehicleExpenses,
    getTotalPayments,
    getTotalExpenses,
    getMonthlyPayments,
    getMonthlyExpenses,

    // Refresh
    refreshData
  }
}
