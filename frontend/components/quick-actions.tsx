'use client'

import { useState } from 'react'
import { Car, CreditCard, Droplets, MapPin, Receipt, Plus, X, Edit2, User } from 'lucide-react'
import { Driver, Vehicle, Payment, OilChange, GPSRecharge, Expense, ExpenseCategory, expenseCategoryLabels } from '@/lib/types'

interface QuickActionProps {
  vehicles: Vehicle[]
  drivers: Driver[]
  onAddPayment: (data: Omit<Payment, 'id'>) => void
  onAddOilChange: (data: Omit<OilChange, 'id'>) => void
  onAddGPSRecharge: (data: Omit<GPSRecharge, 'id'>) => void
  onAddExpense: (data: Omit<Expense, 'id'>) => void
  onAddVehicle: (data: Omit<Vehicle, 'id' | 'createdAt'>) => Promise<Vehicle | undefined>
  onAddDriver: (data: Omit<Driver, 'id' | 'createdAt'>) => Promise<Driver | undefined>
  onAssignDriver: (vehicleId: string, driverId: string, startDate?: string, note?: string) => void
  /** Un AGENT ne peut pas creer de vehicule (reserve a ADMIN/SUPERVISEUR cote backend). */
  canManageFleet?: boolean
  // Edit handlers
  editingPayment?: Payment | null
  editingOilChange?: OilChange | null
  editingGPSRecharge?: GPSRecharge | null
  editingExpense?: Expense | null
  onUpdatePayment?: (id: string, data: Partial<Payment>) => void
  onUpdateOilChange?: (id: string, data: Partial<OilChange>) => void
  onUpdateGPSRecharge?: (id: string, data: Partial<GPSRecharge>) => void
  onUpdateExpense?: (id: string, data: Partial<Expense>) => void
  onCancelEdit?: () => void
}

type ActionType = 'payment' | 'oilChange' | 'gps' | 'expense' | 'vehicle' | null

export function QuickActions({ 
  vehicles, 
  drivers,
  onAddPayment, 
  onAddOilChange, 
  onAddGPSRecharge, 
  onAddExpense,
  onAddVehicle,
  onAddDriver,
  onAssignDriver,
  canManageFleet = true,
  editingPayment,
  editingOilChange,
  editingGPSRecharge,
  editingExpense,
  onUpdatePayment,
  onUpdateOilChange,
  onUpdateGPSRecharge,
  onUpdateExpense,
  onCancelEdit
}: QuickActionProps) {
  const [activeAction, setActiveAction] = useState<ActionType>(null)

  // Auto-open form when editing
  const effectiveAction = editingPayment ? 'payment' 
    : editingOilChange ? 'oilChange'
    : editingGPSRecharge ? 'gps'
    : editingExpense ? 'expense'
    : activeAction

  const handleClose = () => {
    setActiveAction(null)
    onCancelEdit?.()
  }

  const actions = [
    { type: 'vehicle' as const, icon: Car, label: 'Véhicule', color: 'bg-blue-500 hover:bg-blue-600' },
    { type: 'payment' as const, icon: CreditCard, label: 'Versement', color: 'bg-emerald-500 hover:bg-emerald-600' },
    { type: 'oilChange' as const, icon: Droplets, label: 'Vidange', color: 'bg-amber-500 hover:bg-amber-600' },
    { type: 'gps' as const, icon: MapPin, label: 'GPS', color: 'bg-cyan-500 hover:bg-cyan-600' },
    { type: 'expense' as const, icon: Receipt, label: 'Dépense', color: 'bg-rose-500 hover:bg-rose-600' },
  ].filter(a => canManageFleet || a.type !== 'vehicle')

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">Actions Rapides</h2>
      
      <div className="flex flex-wrap gap-2">
        {actions.map(({ type, icon: Icon, label, color }) => (
          <button
            key={type}
            onClick={() => setActiveAction(activeAction === type ? null : type)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-all ${color} ${effectiveAction === type ? 'ring-2 ring-offset-2 ring-offset-background' : ''}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {effectiveAction && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg relative">
          <button 
            onClick={handleClose}
            className="absolute top-2 right-2 p-1 hover:bg-muted rounded"
          >
            <X className="w-4 h-4" />
          </button>

          {effectiveAction === 'vehicle' && (
            <VehicleForm
              drivers={drivers}
              onSubmit={async ({ name, plate, status, driverId, newDriverName }) => {
                const vehicle = await onAddVehicle({ name, plate, driver: '', status })
                if (!vehicle) return
                let resolvedDriverId = driverId
                if (!resolvedDriverId && newDriverName) {
                  const driver = await onAddDriver({ name: newDriverName, status: 'active' })
                  resolvedDriverId = driver?.id
                }
                if (resolvedDriverId) {
                  onAssignDriver(vehicle.id, resolvedDriverId)
                }
                setActiveAction(null)
              }}
            />
          )}
          {effectiveAction === 'payment' && (
            <PaymentForm 
              vehicles={vehicles} 
              editingPayment={editingPayment}
              onSubmit={(data) => { 
                if (editingPayment && onUpdatePayment) {
                  onUpdatePayment(editingPayment.id, data)
                } else {
                  onAddPayment(data as Omit<Payment, 'id'>)
                }
                handleClose()
              }} 
            />
          )}
          {effectiveAction === 'oilChange' && (
            <OilChangeForm 
              vehicles={vehicles} 
              editingOilChange={editingOilChange}
              onSubmit={(data) => { 
                if (editingOilChange && onUpdateOilChange) {
                  onUpdateOilChange(editingOilChange.id, data)
                } else {
                  onAddOilChange(data as Omit<OilChange, 'id'>)
                }
                handleClose()
              }} 
            />
          )}
          {effectiveAction === 'gps' && (
            <GPSForm 
              vehicles={vehicles} 
              editingGPSRecharge={editingGPSRecharge}
              onSubmit={(data) => { 
                if (editingGPSRecharge && onUpdateGPSRecharge) {
                  onUpdateGPSRecharge(editingGPSRecharge.id, data)
                } else {
                  onAddGPSRecharge(data as Omit<GPSRecharge, 'id'>)
                }
                handleClose()
              }} 
            />
          )}
          {effectiveAction === 'expense' && (
            <ExpenseForm 
              vehicles={vehicles} 
              editingExpense={editingExpense}
              onSubmit={(data) => { 
                if (editingExpense && onUpdateExpense) {
                  onUpdateExpense(editingExpense.id, data)
                } else {
                  onAddExpense(data as Omit<Expense, 'id'>)
                }
                handleClose()
              }} 
            />
          )}
        </div>
      )}
    </div>
  )
}

function VehicleForm({
  drivers,
  onSubmit
}: {
  drivers: Driver[]
  onSubmit: (data: {
    name: string
    plate: string
    status: Vehicle['status']
    driverId?: string
    newDriverName?: string
  }) => void
}) {
  const [name, setName] = useState('')
  const [plate, setPlate] = useState('')
  const [driverChoice, setDriverChoice] = useState('') // '' | driverId | '__new'
  const [newDriverName, setNewDriverName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !plate) return
    onSubmit({
      name,
      plate,
      status: 'active',
      driverId: driverChoice && driverChoice !== '__new' ? driverChoice : undefined,
      newDriverName: driverChoice === '__new' ? newDriverName.trim() || undefined : undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-medium flex items-center gap-2"><Car className="w-4 h-4" /> Nouveau Véhicule</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Nom du véhicule"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          required
        />
        <input
          type="text"
          placeholder="Plaque"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          required
        />
        <select
          value={driverChoice}
          onChange={(e) => setDriverChoice(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
        >
          <option value="">Sans chauffeur</option>
          {drivers.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
          <option value="__new">+ Nouveau chauffeur</option>
        </select>
      </div>
      {driverChoice === '__new' && (
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Nom du nouveau chauffeur"
            value={newDriverName}
            onChange={(e) => setNewDriverName(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm"
            required
          />
        </div>
      )}
      <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
        <Plus className="w-4 h-4" /> Ajouter
      </button>
    </form>
  )
}

function PaymentForm({ vehicles, editingPayment, onSubmit }: { 
  vehicles: Vehicle[]
  editingPayment?: Payment | null
  onSubmit: (data: Partial<Payment>) => void 
}) {
  const [vehicleId, setVehicleId] = useState(editingPayment?.vehicleId || '')
  const [amount, setAmount] = useState(editingPayment?.amount?.toString() || '')
  const [date, setDate] = useState(editingPayment?.date || new Date().toISOString().split('T')[0])
  const [note, setNote] = useState(editingPayment?.note || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleId || !amount) return
    onSubmit({ vehicleId, amount: parseFloat(amount), date, note: note || undefined })
  }

  const isEditing = !!editingPayment

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-medium flex items-center gap-2">
        {isEditing ? <Edit2 className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
        {isEditing ? 'Modifier Versement' : 'Nouveau Versement'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          required
        >
          <option value="">Sélectionner véhicule</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.name} - {v.driver}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Montant (FCFA)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          required
        />
        <input
          type="text"
          placeholder="Note (optionnel)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
        />
      </div>
      <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600">
        {isEditing ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {isEditing ? 'Modifier' : 'Enregistrer'}
      </button>
    </form>
  )
}

function OilChangeForm({ vehicles, editingOilChange, onSubmit }: { 
  vehicles: Vehicle[]
  editingOilChange?: OilChange | null
  onSubmit: (data: Partial<OilChange>) => void 
}) {
  const [vehicleId, setVehicleId] = useState(editingOilChange?.vehicleId || '')
  const [date, setDate] = useState(editingOilChange?.date || new Date().toISOString().split('T')[0])
  const [mileage, setMileage] = useState(editingOilChange?.mileage?.toString() || '')
  const [cost, setCost] = useState(editingOilChange?.cost?.toString() || '')
  const [nextChangeDays, setNextChangeDays] = useState(editingOilChange?.nextChangeDays?.toString() || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleId || !mileage || !cost) return
    
    // Calculate next change date based on days
    let nextChangeDate: string | undefined
    if (nextChangeDays) {
      const changeDate = new Date(date)
      const days = parseInt(nextChangeDays)
      nextChangeDate = new Date(changeDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
    
    onSubmit({ 
      vehicleId, 
      date, 
      mileage: parseInt(mileage), 
      cost: parseFloat(cost),
      nextChangeDays: nextChangeDays ? parseInt(nextChangeDays) : undefined,
      nextChangeDate
    })
  }

  const isEditing = !!editingOilChange

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-medium flex items-center gap-2">
        {isEditing ? <Edit2 className="w-4 h-4" /> : <Droplets className="w-4 h-4" />}
        {isEditing ? 'Modifier Vidange' : 'Nouvelle Vidange'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          required
        >
          <option value="">Sélectionner véhicule</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          required
        />
        <input
          type="number"
          placeholder="Kilométrage actuel"
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          required
        />
        <input
          type="number"
          placeholder="Coût (FCFA)"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          required
        />
        <input
          type="number"
          placeholder="Prochaine vidange (jours)"
          value={nextChangeDays}
          onChange={(e) => setNextChangeDays(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Indiquez le nombre de jours avant la prochaine vidange pour recevoir une alerte.
      </p>
      <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
        {isEditing ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {isEditing ? 'Modifier' : 'Enregistrer'}
      </button>
    </form>
  )
}

function GPSForm({ vehicles, editingGPSRecharge, onSubmit }: { 
  vehicles: Vehicle[]
  editingGPSRecharge?: GPSRecharge | null
  onSubmit: (data: Partial<GPSRecharge>) => void 
}) {
  const [vehicleId, setVehicleId] = useState(editingGPSRecharge?.vehicleId || '')
  const [date, setDate] = useState(editingGPSRecharge?.date || new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState(editingGPSRecharge?.amount?.toString() || '')
  const [validityDays, setValidityDays] = useState(editingGPSRecharge?.validityDays?.toString() || '30')
  const [provider, setProvider] = useState(editingGPSRecharge?.provider || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleId || !amount) return
    
    // Calculate expiry date
    const rechargeDate = new Date(date)
    const days = parseInt(validityDays) || 30
    const expiryDate = new Date(rechargeDate.getTime() + days * 24 * 60 * 60 * 1000)
    
    onSubmit({ 
      vehicleId, 
      date, 
      amount: parseFloat(amount), 
      validityDays: days,
      expiryDate: expiryDate.toISOString().split('T')[0],
      provider: provider || undefined 
    })
  }

  const isEditing = !!editingGPSRecharge

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-medium flex items-center gap-2">
        {isEditing ? <Edit2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
        {isEditing ? 'Modifier Recharge GPS' : 'Recharge GPS'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          required
        >
          <option value="">Sélectionner véhicule</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          required
        />
        <input
          type="number"
          placeholder="Montant (FCFA)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          required
        />
        <input
          type="number"
          placeholder="Validité (jours)"
          value={validityDays}
          onChange={(e) => setValidityDays(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
        />
        <input
          type="text"
          placeholder="Fournisseur (optionnel)"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Une alerte sera envoyée 7 jours avant l&apos;expiration du GPS.
      </p>
      <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600">
        {isEditing ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {isEditing ? 'Modifier' : 'Enregistrer'}
      </button>
    </form>
  )
}

function ExpenseForm({ vehicles, editingExpense, onSubmit }: { 
  vehicles: Vehicle[]
  editingExpense?: Expense | null
  onSubmit: (data: Partial<Expense>) => void 
}) {
  const [vehicleId, setVehicleId] = useState(editingExpense?.vehicleId || '')
  const [date, setDate] = useState(editingExpense?.date || new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState(editingExpense?.amount?.toString() || '')
  const [category, setCategory] = useState<ExpenseCategory>(editingExpense?.category || 'fuel')
  const [description, setDescription] = useState(editingExpense?.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleId || !amount || !description) return
    onSubmit({ vehicleId, date, amount: parseFloat(amount), category, description })
  }

  const isEditing = !!editingExpense

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-medium flex items-center gap-2">
        {isEditing ? <Edit2 className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
        {isEditing ? 'Modifier Dépense' : 'Nouvelle Dépense'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          required
        >
          <option value="">Sélectionner véhicule</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
        >
          {Object.entries(expenseCategoryLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Montant (FCFA)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm col-span-1 sm:col-span-2"
          required
        />
      </div>
      <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600">
        {isEditing ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {isEditing ? 'Modifier' : 'Enregistrer'}
      </button>
    </form>
  )
}
