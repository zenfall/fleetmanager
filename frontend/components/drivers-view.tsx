'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  User,
  Plus,
  Car,
  Phone,
  CreditCard as LicenseIcon,
  Trash2,
  Edit2,
  X,
  Search,
  History,
  CheckCircle,
  Link2,
  Link2Off,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Driver, Vehicle, Assignment } from '@/lib/types'

const PAGE_SIZE = 8

interface DriversViewProps {
  drivers: Driver[]
  vehicles: Vehicle[]
  assignments: Assignment[]
  onAddDriver: (data: Omit<Driver, 'id' | 'createdAt'>) => Promise<Driver | undefined>
  onUpdateDriver: (id: string, data: Partial<Driver>) => void
  onDeleteDriver: (id: string) => void
  onAssignDriver: (vehicleId: string, driverId: string, startDate?: string, note?: string) => void
  onEndAssignment: (vehicleId: string) => void
  getDriverAssignments: (driverId: string) => Assignment[]
  getDriverVehicles: (driverId: string) => Vehicle[]
}

export function DriversView({
  drivers,
  vehicles,
  assignments,
  onAddDriver,
  onUpdateDriver,
  onDeleteDriver,
  onAssignDriver,
  onEndAssignment,
  getDriverAssignments,
  getDriverVehicles
}: DriversViewProps) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Driver | null>(null)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [assignForId, setAssignForId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const getVehicleName = (id: string) => vehicles.find(v => v.id === id)?.name || 'Inconnu'
  const formatDate = (date: string) => format(new Date(date), 'dd MMM yyyy', { locale: fr })

  const filtered = useMemo(() => {
    if (!search) return drivers
    const term = search.toLowerCase()
    return drivers.filter(
      d => d.name.toLowerCase().includes(term) || (d.phone || '').includes(term)
    )
  }, [drivers, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const activeVehicleForDriver = (driverId: string) =>
    vehicles.find(v => v.currentDriverId === driverId)

  const startEdit = (driver: Driver) => {
    setEditing(driver)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-foreground">Chauffeurs</h2>
          <p className="text-sm text-muted-foreground">
            {drivers.length} chauffeur{drivers.length > 1 ? 's' : ''} - suivi des affectations
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Nouveau chauffeur
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <DriverForm
          editing={editing}
          onCancel={() => { setShowForm(false); setEditing(null) }}
          onSubmit={data => {
            if (editing) {
              onUpdateDriver(editing.id, data)
            } else {
              onAddDriver(data)
            }
            setShowForm(false)
            setEditing(null)
          }}
        />
      )}

      {/* Search */}
      {drivers.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un chauffeur..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}

      {/* Empty state */}
      {drivers.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
            <User className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="font-medium text-muted-foreground">Aucun chauffeur</p>
          <p className="text-xs text-muted-foreground mt-1">Ajoutez votre premier chauffeur pour suivre les affectations</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {paginated.map(driver => {
            const activeVehicle = activeVehicleForDriver(driver.id)
            const driverVehicles = getDriverVehicles(driver.id)
            const history = getDriverAssignments(driver.id)
            const isExpanded = expandedId === driver.id
            const isAssigning = assignForId === driver.id

            return (
              <div key={driver.id} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold">
                        {driver.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground truncate">{driver.name}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              driver.status === 'active'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {driver.status === 'active' ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        {driver.phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" /> {driver.phone}
                          </p>
                        )}
                        {driver.licenseNumber && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <LicenseIcon className="w-3 h-3" /> {driver.licenseNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEdit(driver)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer le chauffeur ${driver.name} ?`)) onDeleteDriver(driver.id)
                        }}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Current vehicle */}
                  <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Car className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      {activeVehicle ? (
                        <span className="text-sm truncate">
                          Conduit actuellement <span className="font-medium">{activeVehicle.name}</span>
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Aucun vehicule affecte</span>
                      )}
                    </div>
                    {activeVehicle ? (
                      <button
                        onClick={() => onEndAssignment(activeVehicle.id)}
                        className="flex items-center gap-1 text-xs text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg flex-shrink-0"
                      >
                        <Link2Off className="w-3.5 h-3.5" /> Liberer
                      </button>
                    ) : (
                      <button
                        onClick={() => setAssignForId(isAssigning ? null : driver.id)}
                        className="flex items-center gap-1 text-xs text-primary hover:bg-primary/10 px-2 py-1 rounded-lg flex-shrink-0"
                      >
                        <Link2 className="w-3.5 h-3.5" /> Affecter
                      </button>
                    )}
                  </div>

                  {/* Assign form */}
                  {isAssigning && !activeVehicle && (
                    <AssignForm
                      vehicles={vehicles}
                      onCancel={() => setAssignForId(null)}
                      onSubmit={(vehicleId, startDate) => {
                        onAssignDriver(vehicleId, driver.id, startDate)
                        setAssignForId(null)
                      }}
                    />
                  )}

                  {/* Stats + toggle */}
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {driverVehicles.length} vehicule{driverVehicles.length > 1 ? 's' : ''} conduit{driverVehicles.length > 1 ? 's' : ''}
                    </p>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : driver.id)}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <History className="w-3.5 h-3.5" />
                      {isExpanded ? 'Masquer' : 'Historique'}
                    </button>
                  </div>
                </div>

                {/* History */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 p-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Historique des affectations
                    </h4>
                    {history.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucune affectation enregistree</p>
                    ) : (
                      <div className="space-y-2">
                        {history.map(a => (
                          <div key={a.id} className="flex items-center gap-3 text-sm">
                            <div
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                a.endDate ? 'bg-muted-foreground/40' : 'bg-emerald-500'
                              }`}
                            />
                            <span className="font-medium min-w-0 truncate">{getVehicleName(a.vehicleId)}</span>
                            <span className="text-muted-foreground text-xs ml-auto whitespace-nowrap">
                              {formatDate(a.startDate)} - {a.endDate ? formatDate(a.endDate) : 'en cours'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <p className="text-xs text-muted-foreground">
                {filtered.length} chauffeur{filtered.length > 1 ? 's' : ''} - page {currentPage}/{totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Page precedente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DriverForm({
  editing,
  onCancel,
  onSubmit
}: {
  editing: Driver | null
  onCancel: () => void
  onSubmit: (data: Omit<Driver, 'id' | 'createdAt'>) => void
}) {
  const [name, setName] = useState(editing?.name || '')
  const [phone, setPhone] = useState(editing?.phone || '')
  const [licenseNumber, setLicenseNumber] = useState(editing?.licenseNumber || '')
  const [status, setStatus] = useState<Driver['status']>(editing?.status || 'active')
  const [note, setNote] = useState(editing?.note || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      phone: phone.trim() || undefined,
      licenseNumber: licenseNumber.trim() || undefined,
      status,
      note: note.trim() || undefined
    })
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 relative">
      <button onClick={onCancel} className="absolute top-3 right-3 p-1 hover:bg-muted rounded-lg">
        <X className="w-4 h-4" />
      </button>
      <h3 className="font-semibold flex items-center gap-2 mb-4">
        {editing ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {editing ? 'Modifier le chauffeur' : 'Nouveau chauffeur'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Nom complet"
            value={name}
            onChange={e => setName(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
            required
          />
          <input
            type="tel"
            placeholder="Telephone (optionnel)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          />
          <input
            type="text"
            placeholder="Numero de permis (optionnel)"
            value={licenseNumber}
            onChange={e => setLicenseNumber(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          />
          <select
            value={status}
            onChange={e => setStatus(e.target.value as Driver['status'])}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          >
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Note (optionnel)"
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
        >
          {editing ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {editing ? 'Enregistrer' : 'Ajouter'}
        </button>
      </form>
    </div>
  )
}

function AssignForm({
  vehicles,
  onCancel,
  onSubmit
}: {
  vehicles: Vehicle[]
  onCancel: () => void
  onSubmit: (vehicleId: string, startDate: string) => void
}) {
  const [vehicleId, setVehicleId] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  return (
    <div className="mt-2 p-3 rounded-lg border border-dashed border-border bg-background">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-muted-foreground mb-1 block">Vehicule</label>
          <select
            value={vehicleId}
            onChange={e => setVehicleId(e.target.value)}
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-input bg-background"
          >
            <option value="">Selectionner</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.name} - {v.plate}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Depuis</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-input bg-background"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => vehicleId && onSubmit(vehicleId, startDate)}
            disabled={!vehicleId}
            className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
          >
            Affecter
          </button>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
