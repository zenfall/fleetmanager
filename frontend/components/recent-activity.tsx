'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CreditCard, Droplets, MapPin, Receipt, Car, ChevronLeft, ChevronRight, Filter, Calendar } from 'lucide-react'
import { Vehicle, Payment, OilChange, GPSRecharge, Expense, expenseCategoryLabels } from '@/lib/types'

interface RecentActivityProps {
  vehicles: Vehicle[]
  payments: Payment[]
  oilChanges: OilChange[]
  gpsRecharges: GPSRecharge[]
  expenses: Expense[]
}

type ActivityType = 'all' | 'payment' | 'oilChange' | 'gps' | 'expense'

type ActivityItem = {
  id: string
  type: 'payment' | 'oilChange' | 'gps' | 'expense'
  date: string
  vehicleId: string
  amount: number
  description: string
}

const PAGE_SIZE = 8

export function RecentActivity({ vehicles, payments, oilChanges, gpsRecharges, expenses }: RecentActivityProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<ActivityType>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' })

  const getVehicleName = (id: string) => vehicles.find(v => v.id === id)?.name || 'Inconnu'

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM', { locale: fr })
  }

  const formatFullDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy', { locale: fr })
  }

  // Combine all activities
  const allActivities = useMemo(() => {
    const activities: ActivityItem[] = [
      ...payments.map(p => ({
        id: p.id,
        type: 'payment' as const,
        date: p.date,
        vehicleId: p.vehicleId,
        amount: p.amount,
        description: p.note || 'Versement'
      })),
      ...oilChanges.map(o => ({
        id: o.id,
        type: 'oilChange' as const,
        date: o.date,
        vehicleId: o.vehicleId,
        amount: o.cost,
        description: `Vidange - ${o.mileage.toLocaleString()} km`
      })),
      ...gpsRecharges.map(g => ({
        id: g.id,
        type: 'gps' as const,
        date: g.date,
        vehicleId: g.vehicleId,
        amount: g.amount,
        description: g.provider || 'Recharge GPS'
      })),
      ...expenses.map(e => ({
        id: e.id,
        type: 'expense' as const,
        date: e.date,
        vehicleId: e.vehicleId,
        amount: e.amount,
        description: `${expenseCategoryLabels[e.category]} - ${e.description}`
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return activities
  }, [payments, oilChanges, gpsRecharges, expenses])

  // Filter activities
  const filteredActivities = useMemo(() => {
    let result = [...allActivities]

    if (typeFilter !== 'all') {
      result = result.filter(a => a.type === typeFilter)
    }

    if (dateRange.start) {
      result = result.filter(a => new Date(a.date) >= new Date(dateRange.start))
    }
    if (dateRange.end) {
      result = result.filter(a => new Date(a.date) <= new Date(dateRange.end))
    }

    return result
  }, [allActivities, typeFilter, dateRange])

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / PAGE_SIZE)
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const typeConfig = {
    payment: { icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50', prefix: '+', label: 'Versement' },
    oilChange: { icon: Droplets, color: 'text-amber-600', bg: 'bg-amber-50', prefix: '-', label: 'Vidange' },
    gps: { icon: MapPin, color: 'text-cyan-600', bg: 'bg-cyan-50', prefix: '-', label: 'GPS' },
    expense: { icon: Receipt, color: 'text-rose-600', bg: 'bg-rose-50', prefix: '-', label: 'Depense' }
  }

  const typeCounts = useMemo(() => ({
    all: allActivities.length,
    payment: payments.length,
    oilChange: oilChanges.length,
    gps: gpsRecharges.length,
    expense: expenses.length
  }), [allActivities, payments, oilChanges, gpsRecharges, expenses])

  const hasActiveFilters = typeFilter !== 'all' || dateRange.start || dateRange.end

  const clearFilters = () => {
    setTypeFilter('all')
    setDateRange({ start: '', end: '' })
    setCurrentPage(1)
  }

  if (allActivities.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-semibold text-foreground mb-4">Activite Recente</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
            <Car className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="font-medium text-muted-foreground">Aucune activite</p>
          <p className="text-xs text-muted-foreground mt-1">Les operations apparaitront ici</p>
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
            <h2 className="font-semibold text-foreground">Activite Recente</h2>
            <p className="text-xs text-muted-foreground">
              {filteredActivities.length} operation{filteredActivities.length > 1 ? 's' : ''}
              {hasActiveFilters && ' (filtre actif)'}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-3 pt-3 border-t border-border">
            {/* Type filter buttons */}
            <div className="flex flex-wrap gap-1">
              {(['all', 'payment', 'oilChange', 'gps', 'expense'] as const).map(type => {
                const config = type === 'all' ? null : typeConfig[type]
                const isActive = typeFilter === type
                return (
                  <button
                    key={type}
                    onClick={() => { setTypeFilter(type); setCurrentPage(1); }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    {config && <config.icon className="w-3 h-3" />}
                    {type === 'all' ? 'Tous' : config?.label}
                    <span className="opacity-70">({typeCounts[type]})</span>
                  </button>
                )
              })}
            </div>

            {/* Date range */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => { setDateRange(prev => ({ ...prev, start: e.target.value })); setCurrentPage(1); }}
                  className="px-2 py-1 text-xs rounded-lg border border-input bg-background"
                  placeholder="Du"
                />
              </div>
              <span className="text-muted-foreground">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => { setDateRange(prev => ({ ...prev, end: e.target.value })); setCurrentPage(1); }}
                className="px-2 py-1 text-xs rounded-lg border border-input bg-background"
                placeholder="Au"
              />
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded-lg"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="divide-y divide-border">
        {paginatedActivities.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Aucune activite trouvee</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-primary hover:underline mt-1">
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          paginatedActivities.map((activity) => {
            const config = typeConfig[activity.type]
            const Icon = config.icon
            
            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors"
              >
                <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{getVehicleName(activity.vehicleId)}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{activity.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${activity.type === 'payment' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {config.prefix}{formatCurrency(activity.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatFullDate(activity.date)}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
