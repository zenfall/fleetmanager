/** Roles applicatifs. ADMIN : gestion complete (utilisateurs, tout). SUPERVISEUR : vue 360 sur
 *  toutes les saisies + gestion vehicules/chauffeurs. AGENT : saisie terrain (voit ses propres saisies). */
export type Role = 'ADMIN' | 'SUPERVISEUR' | 'AGENT'

export const roleLabels: Record<Role, string> = {
  ADMIN: 'Administrateur',
  SUPERVISEUR: 'Superviseur',
  AGENT: 'Agent'
}

export interface User {
  id: string
  name: string
  role: Role
  email: string
  active: boolean
  createdAt: string
}

/** Donnees necessaires a la creation d'un utilisateur (le mot de passe est defini par l'admin). */
export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: Role
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: Role
  active?: boolean
  password?: string
}

export interface Driver {
  id: string
  name: string
  phone?: string
  licenseNumber?: string
  status: 'active' | 'inactive'
  note?: string
  createdAt: string
}

export interface Vehicle {
  id: string
  name: string
  plate: string
  /** Nom du conducteur actuel (denormalise pour l'affichage). Voir currentDriverId / assignments. */
  driver: string
  /** Chauffeur actuellement affecte au vehicule. */
  currentDriverId?: string
  status: 'active' | 'maintenance' | 'inactive'
  createdAt: string
  gpsExpiryDate?: string
}

/** Historique d'affectation d'un chauffeur a un vehicule. endDate absent = affectation en cours. */
export interface Assignment {
  id: string
  vehicleId: string
  driverId: string
  startDate: string
  endDate?: string
  note?: string
}

export interface Payment {
  id: string
  vehicleId: string
  driverId?: string
  amount: number
  date: string
  note?: string
}

export interface OilChange {
  id: string
  vehicleId: string
  driverId?: string
  date: string
  mileage: number
  cost: number
  nextChangeDays?: number
  nextChangeDate?: string
  note?: string
}

export interface GPSRecharge {
  id: string
  vehicleId: string
  driverId?: string
  date: string
  amount: number
  validityDays?: number
  expiryDate?: string
  provider?: string
}

export interface Expense {
  id: string
  vehicleId: string
  driverId?: string
  date: string
  amount: number
  category: 'fuel' | 'repair' | 'insurance' | 'tax' | 'other'
  description: string
}

export type ExpenseCategory = Expense['category']

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  fuel: 'Carburant',
  repair: 'Réparation',
  insurance: 'Assurance',
  tax: 'Taxes',
  other: 'Autre'
}

/** Types d'operation utilises pour les filtres transversaux. */
export type OperationType = 'payment' | 'oilChange' | 'gps' | 'expense'

export const operationTypeLabels: Record<OperationType, string> = {
  payment: 'Versement',
  oilChange: 'Vidange',
  gps: 'Recharge GPS',
  expense: 'Dépense'
}

/** Element d'operation unifie pour l'affichage transversal (vue Operations). */
export interface OperationItem {
  id: string
  type: OperationType
  date: string
  vehicleId: string
  driverId?: string
  amount: number
  /** true si c'est une recette (versement), false si c'est une charge. */
  isIncome: boolean
  description: string
  category?: ExpenseCategory
}

export interface Alert {
  id: string
  vehicleId: string
  vehicleName: string
  type: 'oil_change' | 'gps_expiry'
  message: string
  severity: 'warning' | 'danger'
  date: string
}
