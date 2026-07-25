'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { 
  CreditCard, 
  Droplets, 
  MapPin, 
  Receipt, 
  Car, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Gauge,
  Users
} from 'lucide-react'
import { Vehicle, Assignment, Payment, OilChange, GPSRecharge, Expense, expenseCategoryLabels } from '@/lib/types'
import { DataTable } from './data-table'

interface VehicleDetailsProps {
  vehicle: Vehicle | null
  driverName?: string | null
  assignments?: Assignment[]
  getDriverName?: (id?: string) => string | null
  payments: Payment[]
  oilChanges: OilChange[]
  gpsRecharges: GPSRecharge[]
  expenses: Expense[]
  onDeletePayment: (id: string) => void
  onDeleteOilChange: (id: string) => void
  onDeleteGPSRecharge: (id: string) => void
  onDeleteExpense: (id: string) => void
  onEditPayment?: (payment: Payment) => void
  onEditOilChange?: (oilChange: OilChange) => void
  onEditGPSRecharge?: (gpsRecharge: GPSRecharge) => void
  onEditExpense?: (expense: Expense) => void
}

type TabType = 'overview' | 'drivers' | 'payments' | 'oilChanges' | 'gps' | 'expenses'

export function VehicleDetails({
  vehicle,
  driverName,
  assignments = [],
  getDriverName,
  payments,
  oilChanges,
  gpsRecharges,
  expenses,
  onDeletePayment,
  onDeleteOilChange,
  onDeleteGPSRecharge,
  onDeleteExpense,
  onEditPayment,
  onEditOilChange,
  onEditGPSRecharge,
  onEditExpense
}: VehicleDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy', { locale: fr })
  }

  if (!vehicle) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 h-full min-h-[500px] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Car className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">Selectionnez un vehicule</p>
        <p className="text-sm text-muted-foreground/70 mt-1">pour voir les details et statistiques</p>
      </div>
    )
  }

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalOilCosts = oilChanges.reduce((sum, o) => sum + o.cost, 0)
  const totalGPSCosts = gpsRecharges.reduce((sum, g) => sum + g.amount, 0)
  const allCosts = totalExpenses + totalOilCosts + totalGPSCosts
  const profit = totalPayments - allCosts

  const tabs = [
    { id: 'overview' as const, label: 'Apercu', icon: Car },
    { id: 'drivers' as const, label: `Chauffeurs (${assignments.length})`, icon: Users },
    { id: 'payments' as const, label: `Versements (${payments.length})`, icon: CreditCard },
    { id: 'oilChanges' as const, label: `Vidanges (${oilChanges.length})`, icon: Droplets },
    { id: 'gps' as const, label: `GPS (${gpsRecharges.length})`, icon: MapPin },
    { id: 'expenses' as const, label: `Depenses (${expenses.length})`, icon: Receipt },
  ]

  return (
    <div className="space-y-4">
      {/* Vehicle Header Card */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Car className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{vehicle.name}</h2>
              <p className="text-sm text-muted-foreground">{vehicle.plate}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                {driverName || vehicle.driver ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {driverName || vehicle.driver}
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40"></span>
                    <span className="italic">Aucun chauffeur</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className={`text-right px-4 py-2 rounded-lg ${profit >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
            <p className="text-xs text-muted-foreground mb-0.5">Profit Total</p>
            <p className={`text-lg font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={TrendingUp}
            label="Total Versements"
            value={formatCurrency(totalPayments)}
            color="emerald"
          />
          <StatCard
            icon={TrendingDown}
            label="Total Depenses"
            value={formatCurrency(allCosts)}
            color="rose"
          />
          <StatCard
            icon={Droplets}
            label="Vidanges"
            value={oilChanges.length.toString()}
            subValue={formatCurrency(totalOilCosts)}
            color="amber"
          />
          <StatCard
            icon={MapPin}
            label="Recharges GPS"
            value={gpsRecharges.length.toString()}
            subValue={formatCurrency(totalGPSCosts)}
            color="cyan"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="border-b border-border px-2 overflow-x-auto">
          <div className="flex gap-1 py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'overview' && (
            <OverviewTab 
              payments={payments}
              oilChanges={oilChanges}
              gpsRecharges={gpsRecharges}
              expenses={expenses}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          )}

          {activeTab === 'drivers' && (
            <DriversTab
              assignments={assignments}
              currentDriverId={vehicle.currentDriverId}
              getDriverName={getDriverName}
              formatDate={formatDate}
            />
          )}

          {activeTab === 'payments' && (
            <DataTable
              data={payments}
              title="Historique des Versements"
              emptyMessage="Aucun versement enregistre"
              pageSize={8}
              searchKeys={['note']}
              dateFilterKey="date"
              exportable
              columns={[
                { 
                  key: 'date', 
                  label: 'Date', 
                  sortable: true,
                  render: (p) => (
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(p.date)}
                    </span>
                  )
                },
                { 
                  key: 'amount', 
                  label: 'Montant', 
                  sortable: true,
                  render: (p) => (
                    <span className="font-semibold text-emerald-600">+{formatCurrency(p.amount)}</span>
                  )
                },
                { 
                  key: 'note', 
                  label: 'Note',
                  render: (p) => p.note || '-'
                }
              ]}
              onEdit={onEditPayment}
              onDelete={(p) => onDeletePayment(p.id)}
            />
          )}

          {activeTab === 'oilChanges' && (
            <DataTable
              data={oilChanges}
              title="Historique des Vidanges"
              emptyMessage="Aucune vidange enregistree"
              pageSize={8}
              dateFilterKey="date"
              exportable
              columns={[
                { 
                  key: 'date', 
                  label: 'Date', 
                  sortable: true,
                  render: (o) => formatDate(o.date)
                },
                { 
                  key: 'mileage', 
                  label: 'Kilometrage', 
                  sortable: true,
                  render: (o) => (
                    <span className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-muted-foreground" />
                      {o.mileage.toLocaleString()} km
                    </span>
                  )
                },
                { 
                  key: 'cost', 
                  label: 'Cout', 
                  sortable: true,
                  render: (o) => (
                    <span className="font-semibold text-amber-600">{formatCurrency(o.cost)}</span>
                  )
                },
                { 
                  key: 'nextChangeDate', 
                  label: 'Prochaine',
                  render: (o) => o.nextChangeDate ? formatDate(o.nextChangeDate) : '-'
                }
              ]}
              onEdit={onEditOilChange}
              onDelete={(o) => onDeleteOilChange(o.id)}
            />
          )}

          {activeTab === 'gps' && (
            <DataTable
              data={gpsRecharges}
              title="Historique des Recharges GPS"
              emptyMessage="Aucune recharge GPS enregistree"
              pageSize={8}
              searchKeys={['provider']}
              dateFilterKey="date"
              exportable
              columns={[
                { 
                  key: 'date', 
                  label: 'Date', 
                  sortable: true,
                  render: (g) => formatDate(g.date)
                },
                { 
                  key: 'amount', 
                  label: 'Montant', 
                  sortable: true,
                  render: (g) => (
                    <span className="font-semibold text-cyan-600">{formatCurrency(g.amount)}</span>
                  )
                },
                { 
                  key: 'provider', 
                  label: 'Fournisseur',
                  render: (g) => g.provider || '-'
                },
                { 
                  key: 'expiryDate', 
                  label: 'Expiration',
                  sortable: true,
                  render: (g) => {
                    if (!g.expiryDate) return '-'
                    const isExpired = new Date(g.expiryDate) < new Date()
                    const isSoon = new Date(g.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    return (
                      <span className={`${isExpired ? 'text-rose-600' : isSoon ? 'text-amber-600' : ''}`}>
                        {formatDate(g.expiryDate)}
                      </span>
                    )
                  }
                }
              ]}
              onEdit={onEditGPSRecharge}
              onDelete={(g) => onDeleteGPSRecharge(g.id)}
            />
          )}

          {activeTab === 'expenses' && (
            <DataTable
              data={expenses}
              title="Historique des Depenses"
              emptyMessage="Aucune depense enregistree"
              pageSize={8}
              searchKeys={['description']}
              dateFilterKey="date"
              exportable
              filterOptions={[
                {
                  key: 'category',
                  label: 'Categorie',
                  options: Object.entries(expenseCategoryLabels).map(([value, label]) => ({ value, label }))
                }
              ]}
              columns={[
                { 
                  key: 'date', 
                  label: 'Date', 
                  sortable: true,
                  render: (e) => formatDate(e.date)
                },
                { 
                  key: 'category', 
                  label: 'Categorie',
                  render: (e) => (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted">
                      {expenseCategoryLabels[e.category]}
                    </span>
                  )
                },
                { 
                  key: 'description', 
                  label: 'Description'
                },
                { 
                  key: 'amount', 
                  label: 'Montant', 
                  sortable: true,
                  render: (e) => (
                    <span className="font-semibold text-rose-600">{formatCurrency(e.amount)}</span>
                  )
                }
              ]}
              onEdit={onEditExpense}
              onDelete={(e) => onDeleteExpense(e.id)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  color 
}: { 
  icon: React.ElementType
  label: string
  value: string
  subValue?: string
  color: 'emerald' | 'rose' | 'amber' | 'cyan'
}) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    cyan: 'bg-cyan-50 text-cyan-600'
  }

  return (
    <div className={`${colors[color]} rounded-lg p-3`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" />
        <p className="text-xs opacity-80">{label}</p>
      </div>
      <p className="font-bold text-base">{value}</p>
      {subValue && <p className="text-xs opacity-70">{subValue}</p>}
    </div>
  )
}

function DriversTab({
  assignments,
  currentDriverId,
  getDriverName,
  formatDate
}: {
  assignments: Assignment[]
  currentDriverId?: string
  getDriverName?: (id?: string) => string | null
  formatDate: (date: string) => string
}) {
  const resolveName = (id?: string) => (getDriverName ? getDriverName(id) : null) || 'Chauffeur'

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
          <Users className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="font-medium text-muted-foreground">Aucun chauffeur affecte</p>
        <p className="text-xs text-muted-foreground mt-1">
          Affectez un chauffeur depuis la section Chauffeurs
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
        Historique des chauffeurs
      </p>
      <div className="relative pl-4">
        <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
        {assignments.map(a => {
          const isCurrent = !a.endDate && a.driverId === currentDriverId
          return (
            <div key={a.id} className="relative pb-4 last:pb-0">
              <div
                className={`absolute -left-[9px] top-1 w-3 h-3 rounded-full border-2 border-card ${
                  isCurrent ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                }`}
              />
              <div className="flex items-center justify-between gap-2 pl-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                    {resolveName(a.driverId).charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{resolveName(a.driverId)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(a.startDate)} - {a.endDate ? formatDate(a.endDate) : 'en cours'}
                    </p>
                  </div>
                </div>
                {isCurrent && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 flex-shrink-0">
                    Actuel
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OverviewTab({
  payments,
  oilChanges,
  gpsRecharges,
  expenses,
  formatCurrency,
  formatDate
}: {
  payments: Payment[]
  oilChanges: OilChange[]
  gpsRecharges: GPSRecharge[]
  expenses: Expense[]
  formatCurrency: (amount: number) => string
  formatDate: (date: string) => string
}) {
  // Get recent items (last 5 of each)
  const recentPayments = payments.slice(0, 5)
  const recentOilChanges = oilChanges.slice(0, 3)
  const recentGPS = gpsRecharges.slice(0, 3)
  const recentExpenses = expenses.slice(0, 5)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Recent Payments */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-500" />
          Derniers Versements
        </h3>
        {recentPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun versement</p>
        ) : (
          <div className="space-y-2">
            {recentPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{formatDate(p.date)}</span>
                <span className="text-sm font-medium text-emerald-600">+{formatCurrency(p.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Expenses */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-rose-500" />
          Dernieres Depenses
        </h3>
        {recentExpenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune depense</p>
        ) : (
          <div className="space-y-2">
            {recentExpenses.map(e => (
              <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div>
                  <span className="text-sm">{e.description}</span>
                  <span className="text-xs text-muted-foreground ml-2">({expenseCategoryLabels[e.category]})</span>
                </div>
                <span className="text-sm font-medium text-rose-600">{formatCurrency(e.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Oil Changes */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-amber-500" />
          Dernieres Vidanges
        </h3>
        {recentOilChanges.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune vidange</p>
        ) : (
          <div className="space-y-2">
            {recentOilChanges.map(o => (
              <div key={o.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div>
                  <span className="text-sm">{formatDate(o.date)}</span>
                  <span className="text-xs text-muted-foreground ml-2">{o.mileage.toLocaleString()} km</span>
                </div>
                <span className="text-sm font-medium text-amber-600">{formatCurrency(o.cost)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent GPS */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-500" />
          Dernieres Recharges GPS
        </h3>
        {recentGPS.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune recharge GPS</p>
        ) : (
          <div className="space-y-2">
            {recentGPS.map(g => (
              <div key={g.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div>
                  <span className="text-sm">{formatDate(g.date)}</span>
                  {g.expiryDate && (
                    <span className="text-xs text-muted-foreground ml-2">Exp: {formatDate(g.expiryDate)}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-cyan-600">{formatCurrency(g.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
