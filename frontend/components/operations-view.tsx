'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  CreditCard,
  Droplets,
  MapPin,
  Receipt,
  Calendar,
  User,
  Car,
  Download,
  TrendingUp,
  TrendingDown,
  Wallet,
  ListFilter,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Driver, Vehicle, OperationItem, OperationType, operationTypeLabels, Role } from '@/lib/types'

interface OperationsViewProps {
  operations: OperationItem[]
  vehicles: Vehicle[]
  drivers: Driver[]
  getDriverName: (id?: string) => string | null
  currentUserRole?: Role
}

type PeriodPreset = '7d' | '30d' | 'month' | '3m' | 'year' | 'all' | 'custom'

const periodPresets: { value: PeriodPreset; label: string }[] = [
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: 'month', label: 'Ce mois' },
  { value: '3m', label: '3 mois' },
  { value: 'year', label: 'Cette annee' },
  { value: 'all', label: 'Tout' },
  { value: 'custom', label: 'Personnalise' }
]

const typeConfig: Record<OperationType, { icon: React.ElementType; color: string; bg: string }> = {
  payment: { icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  oilChange: { icon: Droplets, color: 'text-amber-600', bg: 'bg-amber-50' },
  gps: { icon: MapPin, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  expense: { icon: Receipt, color: 'text-rose-600', bg: 'bg-rose-50' }
}

const PAGE_SIZE = 12

function getPresetRange(preset: PeriodPreset): { start: string; end: string } {
  const now = new Date()
  const end = now.toISOString().split('T')[0]
  const startOf = (d: Date) => d.toISOString().split('T')[0]
  switch (preset) {
    case '7d':
      return { start: startOf(new Date(now.getTime() - 7 * 864e5)), end }
    case '30d':
      return { start: startOf(new Date(now.getTime() - 30 * 864e5)), end }
    case 'month':
      return { start: startOf(new Date(now.getFullYear(), now.getMonth(), 1)), end }
    case '3m':
      return { start: startOf(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())), end }
    case 'year':
      return { start: startOf(new Date(now.getFullYear(), 0, 1)), end }
    default:
      return { start: '', end: '' }
  }
}

export function OperationsView({ operations, vehicles, drivers, getDriverName, currentUserRole }: OperationsViewProps) {
  const [period, setPeriod] = useState<PeriodPreset>('30d')
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [driverId, setDriverId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [type, setType] = useState<OperationType | 'all'>('all')
  const [page, setPage] = useState(1)

  const range = useMemo(() => {
    if (period === 'custom') return customRange
    return getPresetRange(period)
  }, [period, customRange])

  const getVehicleName = (id: string) => vehicles.find(v => v.id === id)?.name || 'Inconnu'

  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  const formatDate = (date: string) => format(new Date(date), 'dd MMM yyyy', { locale: fr })

  const filtered = useMemo(() => {
    let result = [...operations]
    if (range.start) result = result.filter(o => new Date(o.date) >= new Date(range.start))
    if (range.end) result = result.filter(o => new Date(o.date) <= new Date(range.end + 'T23:59:59'))
    if (type !== 'all') result = result.filter(o => o.type === type)
    if (vehicleId) result = result.filter(o => o.vehicleId === vehicleId)
    if (driverId) result = result.filter(o => o.driverId === driverId)
    return result
  }, [operations, range, type, vehicleId, driverId])

  const totals = useMemo(() => {
    let income = 0
    let charges = 0
    filtered.forEach(o => {
      if (o.isIncome) income += o.amount
      else charges += o.amount
    })
    return { income, charges, balance: income - charges, count: filtered.length }
  }, [filtered])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const resetFilters = () => {
    setPeriod('30d')
    setCustomRange({ start: '', end: '' })
    setDriverId('')
    setVehicleId('')
    setType('all')
    setPage(1)
  }

  const handleExport = () => {
    const headers = ['Date', 'Type', 'Vehicule', 'Chauffeur', 'Description', 'Montant', 'Sens']
    const rows = filtered.map(o =>
      [
        o.date,
        operationTypeLabels[o.type],
        getVehicleName(o.vehicleId),
        getDriverName(o.driverId) || '-',
        `"${o.description.replace(/"/g, '""')}"`,
        o.amount,
        o.isIncome ? 'Recette' : 'Charge'
      ].join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `operations_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  const hasFilters = driverId || vehicleId || type !== 'all' || period !== '30d'

  return (
    <div className="space-y-6">
      {/* Titre - Vue 360 pour SUPERVISEUR/ADMIN, vue personnelle pour AGENT */}
      <div>
        <h1 className="text-xl font-bold text-foreground">
          {currentUserRole === 'AGENT' ? 'Mes operations' : 'Vue 360 - Operations'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {currentUserRole === 'AGENT'
            ? 'Historique de vos propres saisies (versements, vidanges, GPS, depenses).'
            : 'Toutes les saisies de tous les agents, tous vehicules confondus.'}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard icon={TrendingUp} label="Recettes" value={formatCurrency(totals.income)} tone="emerald" />
        <SummaryCard icon={TrendingDown} label="Charges" value={formatCurrency(totals.charges)} tone="rose" />
        <SummaryCard
          icon={Wallet}
          label="Solde"
          value={`${totals.balance >= 0 ? '+' : '-'}${formatCurrency(Math.abs(totals.balance))}`}
          tone={totals.balance >= 0 ? 'emerald' : 'rose'}
        />
        <SummaryCard icon={ListFilter} label="Operations" value={totals.count.toString()} tone="blue" />
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-primary" /> Filtres
          </h2>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded-lg"
            >
              <X className="w-3 h-3" /> Reinitialiser
            </button>
          )}
        </div>

        {/* Period presets */}
        <div>
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
            <Calendar className="w-3.5 h-3.5" /> Periode
          </label>
          <div className="flex flex-wrap gap-1.5">
            {periodPresets.map(p => (
              <button
                key={p.value}
                onClick={() => { setPeriod(p.value); setPage(1) }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  period === p.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/70 text-muted-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {period === 'custom' && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <input
                type="date"
                value={customRange.start}
                onChange={e => { setCustomRange(prev => ({ ...prev, start: e.target.value })); setPage(1) }}
                className="px-3 py-1.5 text-sm rounded-lg border border-input bg-background"
              />
              <span className="text-muted-foreground text-sm">au</span>
              <input
                type="date"
                value={customRange.end}
                onChange={e => { setCustomRange(prev => ({ ...prev, end: e.target.value })); setPage(1) }}
                className="px-3 py-1.5 text-sm rounded-lg border border-input bg-background"
              />
            </div>
          )}
        </div>

        {/* Type filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Type d&apos;operation</label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setType('all'); setPage(1) }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                type === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70 text-muted-foreground'
              }`}
            >
              Tous
            </button>
            {(Object.keys(operationTypeLabels) as OperationType[]).map(t => {
              const cfg = typeConfig[t]
              const Icon = cfg.icon
              return (
                <button
                  key={t}
                  onClick={() => { setType(t); setPage(1) }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    type === t ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70 text-muted-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {operationTypeLabels[t]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Driver + vehicle selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1.5">
              <User className="w-3.5 h-3.5" /> Chauffeur
            </label>
            <select
              value={driverId}
              onChange={e => { setDriverId(e.target.value); setPage(1) }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
            >
              <option value="">Tous les chauffeurs</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1.5">
              <Car className="w-3.5 h-3.5" /> Vehicule
            </label>
            <select
              value={vehicleId}
              onChange={e => { setVehicleId(e.target.value); setPage(1) }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
            >
              <option value="">Tous les vehicules</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.name} - {v.plate}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground">Operations</h2>
            <p className="text-xs text-muted-foreground">
              {filtered.length} resultat{filtered.length > 1 ? 's' : ''}
            </p>
          </div>
          {filtered.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-input hover:bg-muted transition-colors"
            >
              <Download className="w-4 h-4" /> Exporter
            </button>
          )}
        </div>

        {paginated.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
              <ListFilter className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="font-medium text-muted-foreground">Aucune operation</p>
            <p className="text-xs text-muted-foreground mt-1">Ajustez les filtres pour voir des resultats</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Vehicule</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Chauffeur</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map(o => {
                    const cfg = typeConfig[o.type]
                    const Icon = cfg.icon
                    const driverName = getDriverName(o.driverId)
                    return (
                      <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDate(o.date)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {operationTypeLabels[o.type]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{getVehicleName(o.vehicleId)}</td>
                        <td className="px-4 py-3 text-sm">
                          {driverName ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                {driverName.charAt(0).toUpperCase()}
                              </span>
                              {driverName}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{o.description}</td>
                        <td className={`px-4 py-3 text-right text-sm font-semibold whitespace-nowrap ${o.isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {o.isIncome ? '+' : '-'}{formatCurrency(o.amount)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {paginated.map(o => {
                const cfg = typeConfig[o.type]
                const Icon = cfg.icon
                const driverName = getDriverName(o.driverId)
                return (
                  <div key={o.id} className="p-3 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{getVehicleName(o.vehicleId)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {driverName ? `${driverName} - ` : ''}{formatDate(o.date)}
                      </p>
                    </div>
                    <p className={`text-sm font-semibold whitespace-nowrap ${o.isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {o.isIncome ? '+' : '-'}{formatCurrency(o.amount)}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-3 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Page {currentPage} sur {totalPages}</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: React.ElementType
  label: string
  value: string
  tone: 'emerald' | 'rose' | 'blue'
}) {
  const tones = {
    emerald: 'bg-emerald-100 text-emerald-600',
    rose: 'bg-rose-100 text-rose-600',
    blue: 'bg-blue-100 text-blue-600'
  }
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-lg font-bold text-foreground truncate" title={value}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}
