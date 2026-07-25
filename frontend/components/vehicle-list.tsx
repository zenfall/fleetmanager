'use client'

import { useState, useMemo } from 'react'
import { Car, MoreVertical, Trash2, Edit2, CheckCircle, AlertCircle, PauseCircle, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { Vehicle } from '@/lib/types'

const PAGE_SIZE = 6

interface VehicleListProps {
  vehicles: Vehicle[]
  onSelectVehicle: (id: string) => void
  selectedVehicleId: string | null
  onDeleteVehicle: (id: string) => void
  onUpdateVehicle: (id: string, data: Partial<Vehicle>) => void
}

const statusConfig = {
  active: { label: 'Actif', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  maintenance: { label: 'Maintenance', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  inactive: { label: 'Inactif', icon: PauseCircle, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
}

export function VehicleList({ 
  vehicles, 
  onSelectVehicle, 
  selectedVehicleId, 
  onDeleteVehicle,
  onUpdateVehicle
}: VehicleListProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  const filteredVehicles = useMemo(() => {
    let result = [...vehicles]
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(v => 
        v.name.toLowerCase().includes(term) ||
        v.plate.toLowerCase().includes(term) ||
        v.driver.toLowerCase().includes(term)
      )
    }
    
    if (statusFilter) {
      result = result.filter(v => v.status === statusFilter)
    }
    
    return result
  }, [vehicles, searchTerm, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedVehicles = filteredVehicles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const statusCounts = useMemo(() => {
    return {
      all: vehicles.length,
      active: vehicles.filter(v => v.status === 'active').length,
      maintenance: vehicles.filter(v => v.status === 'maintenance').length,
      inactive: vehicles.filter(v => v.status === 'inactive').length,
    }
  }, [vehicles])

  if (vehicles.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">Mes Vehicules</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
            <Car className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="font-medium text-muted-foreground">Aucun vehicule</p>
          <p className="text-xs text-muted-foreground mt-1">Ajoutez votre premier vehicule</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-foreground">Mes Vehicules</h2>
            <p className="text-xs text-muted-foreground">
              {statusCounts.active} actif{statusCounts.active > 1 ? 's' : ''} sur {statusCounts.all}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters || searchTerm || statusFilter
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter */}
        {showFilters && (
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
            >
              <option value="">Tous les statuts ({statusCounts.all})</option>
              <option value="active">Actifs ({statusCounts.active})</option>
              <option value="maintenance">En maintenance ({statusCounts.maintenance})</option>
              <option value="inactive">Inactifs ({statusCounts.inactive})</option>
            </select>
          </div>
        )}
      </div>

      {/* Vehicle List */}
      <div className="max-h-[500px] overflow-y-auto">
        {filteredVehicles.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Aucun vehicule trouve</p>
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter(''); setPage(1) }}
              className="text-sm text-primary hover:underline mt-1"
            >
              Effacer les filtres
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedVehicles.map((vehicle) => {
              const status = statusConfig[vehicle.status]
              const isSelected = selectedVehicleId === vehicle.id
              
              return (
                <div
                  key={vehicle.id}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-primary/5 border-l-4 border-l-primary' 
                      : 'hover:bg-muted/50 border-l-4 border-l-transparent'
                  }`}
                  onClick={() => onSelectVehicle(vehicle.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-lg ${status.bg} flex items-center justify-center flex-shrink-0`}>
                        <Car className={`w-5 h-5 ${status.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{vehicle.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color} border ${status.border}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{vehicle.plate}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          {vehicle.driver ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {vehicle.driver}
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"></span>
                              <span className="italic">Aucun chauffeur</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative flex-shrink-0">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation()
                          setMenuOpen(menuOpen === vehicle.id ? null : vehicle.id) 
                        }}
                        className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                      
                      {menuOpen === vehicle.id && (
                        <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg z-20 py-1 min-w-40">
                          <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium border-b border-border">
                            Changer statut
                          </div>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <button
                              key={key}
                              onClick={(e) => { 
                                e.stopPropagation()
                                onUpdateVehicle(vehicle.id, { status: key as Vehicle['status'] })
                                setMenuOpen(null)
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left ${
                                vehicle.status === key ? 'bg-muted/50' : ''
                              }`}
                            >
                              <config.icon className={`w-4 h-4 ${config.color}`} />
                              {config.label}
                              {vehicle.status === key && (
                                <CheckCircle className="w-3 h-3 ml-auto text-primary" />
                              )}
                            </button>
                          ))}
                          <div className="border-t border-border mt-1 pt-1">
                            <button
                              onClick={(e) => { 
                                e.stopPropagation()
                                if (confirm('Supprimer ce vehicule et toutes ses donnees ?')) {
                                  onDeleteVehicle(vehicle.id)
                                }
                                setMenuOpen(null)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive text-left"
                            >
                              <Trash2 className="w-4 h-4" /> Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer / Pagination */}
      <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {filteredVehicles.length} vehicule{filteredVehicles.length > 1 ? 's' : ''}
          {totalPages > 1 ? ` - page ${currentPage}/${totalPages}` : ''}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Page precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
