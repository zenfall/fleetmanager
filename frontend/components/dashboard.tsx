'use client'

import { useState } from 'react'
import { Menu, X, Settings, Bell, LogOut, User, ChevronDown, LayoutDashboard, ListFilter, Users } from 'lucide-react'
import { useFleetData } from '@/hooks/use-fleet-data'
import { useAuth } from '@/lib/auth-context'
import { StatsCards } from '@/components/stats-cards'
import { QuickActions } from '@/components/quick-actions'
import { VehicleList } from '@/components/vehicle-list'
import { VehicleDetails } from '@/components/vehicle-details'
import { RecentActivity } from '@/components/recent-activity'
import { AlertsPanel } from '@/components/alerts-panel'
import { UserManagement } from '@/components/user-management'
import { OperationsView } from '@/components/operations-view'
import { DriversView } from '@/components/drivers-view'
import { Payment, OilChange, GPSRecharge, Expense, roleLabels } from '@/lib/types'

type View = 'dashboard' | 'operations' | 'drivers'

const navItems: { id: View; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'operations', label: 'Opérations', icon: ListFilter },
  { id: 'drivers', label: 'Chauffeurs', icon: Users }
]

export function Dashboard() {
  const [view, setView] = useState<View>('dashboard')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Editing states
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [editingOilChange, setEditingOilChange] = useState<OilChange | null>(null)
  const [editingGPSRecharge, setEditingGPSRecharge] = useState<GPSRecharge | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const { logout } = useAuth()

  const {
    users,
    currentUser,
    isAdmin,
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
    canManageFleet,
    addUser,
    updateUser,
    deleteUser,
    addDriver,
    updateDriver,
    deleteDriver,
    assignDriver,
    endAssignment,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addPayment,
    updatePayment,
    deletePayment,
    addOilChange,
    updateOilChange,
    deleteOilChange,
    addGPSRecharge,
    updateGPSRecharge,
    deleteGPSRecharge,
    addExpense,
    updateExpense,
    deleteExpense,
    getVehicleById,
    getDriverName,
    getDriverAssignments,
    getDriverVehicles,
    getVehiclePayments,
    getVehicleOilChanges,
    getVehicleGPSRecharges,
    getVehicleExpenses,
    getMonthlyPayments,
    getMonthlyExpenses
  } = useFleetData()

  // Get this month's counts
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyOilChanges = oilChanges.filter(o => new Date(o.date) >= startOfMonth).length
  const monthlyGPSRecharges = gpsRecharges.filter(g => new Date(g.date) >= startOfMonth).length
  const activeVehicles = vehicles.filter(v => v.status === 'active').length

  const selectedVehicle = selectedVehicleId ? getVehicleById(selectedVehicleId) : null

  const handleCancelEdit = () => {
    setEditingPayment(null)
    setEditingOilChange(null)
    setEditingGPSRecharge(null)
    setEditingExpense(null)
  }

  // When editing an operation, jump back to dashboard where the form lives
  const startEditFromAnywhere = <T,>(setter: (v: T) => void) => (item: T) => {
    setter(item)
    setView('dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img
            src="/logo-symbole.png"
            alt="Good Entrepreneur"
            className="w-16 h-auto mx-auto mb-4 animate-pulse"
          />
          <p className="text-muted-foreground font-medium">Chargement...</p>
          <p className="text-xs text-muted-foreground mt-1">FleetManager</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/logo-symbole.png"
                alt="Good Entrepreneur"
                className="h-10 w-auto"
              />
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg text-foreground">FleetManager</h1>
                <p className="text-xs text-muted-foreground -mt-0.5">Gestion de flotte</p>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    view === item.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {alerts.length > 0 && (
                <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {alerts.length > 9 ? '9+' : alerts.length}
                  </span>
                </button>
              )}

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">{currentUser?.name || 'Utilisateur'}</p>
                    <p className="text-xs text-muted-foreground">
                      {currentUser ? roleLabels[currentUser.role] : 'Non connecte'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-3 border-b border-border bg-muted/30">
                      <p className="font-medium text-sm">{currentUser?.name || 'Non connecte'}</p>
                      <p className="text-xs text-muted-foreground">{currentUser?.email || ''}</p>
                    </div>
                    <div className="p-1">
                      {isAdmin && (
                        <button
                          onClick={() => { setShowSettings(true); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-lg text-left"
                        >
                          <Settings className="w-4 h-4" /> Gestion utilisateurs
                        </button>
                      )}
                      <button
                        onClick={() => { logout('manual'); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-lg text-left text-rose-600"
                      >
                        <LogOut className="w-4 h-4" /> Deconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-border px-4 py-2 flex flex-col gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setView(item.id); setShowMobileMenu(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  view === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Click outside to close menus */}
      {showUserMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Settings Panel - reserve a l'ADMIN */}
        {showSettings && isAdmin && (
          <div className="relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute -top-2 right-0 p-2 hover:bg-muted rounded-lg z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <UserManagement
              users={users}
              currentUser={currentUser}
              onAddUser={addUser}
              onUpdateUser={updateUser}
              onDeleteUser={deleteUser}
            />
          </div>
        )}

        {view === 'dashboard' && (
          <>
            {/* Alerts */}
            <AlertsPanel alerts={alerts} />

            {/* Stats Cards */}
            <StatsCards
              vehicleCount={vehicles.length}
              activeVehicles={activeVehicles}
              monthlyPayments={getMonthlyPayments()}
              monthlyExpenses={getMonthlyExpenses()}
              totalOilChanges={monthlyOilChanges}
              totalGPSRecharges={monthlyGPSRecharges}
            />

            {/* Quick Actions */}
            <QuickActions
              vehicles={vehicles}
              drivers={drivers}
              onAddPayment={addPayment}
              onAddOilChange={addOilChange}
              onAddGPSRecharge={addGPSRecharge}
              onAddExpense={addExpense}
              onAddVehicle={addVehicle}
              onAddDriver={addDriver}
              onAssignDriver={assignDriver}
              canManageFleet={canManageFleet}
              editingPayment={editingPayment}
              editingOilChange={editingOilChange}
              editingGPSRecharge={editingGPSRecharge}
              editingExpense={editingExpense}
              onUpdatePayment={updatePayment}
              onUpdateOilChange={updateOilChange}
              onUpdateGPSRecharge={updateGPSRecharge}
              onUpdateExpense={updateExpense}
              onCancelEdit={handleCancelEdit}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3">
                <VehicleList
                  vehicles={vehicles}
                  onSelectVehicle={(id) => setSelectedVehicleId(id)}
                  selectedVehicleId={selectedVehicleId}
                  onDeleteVehicle={deleteVehicle}
                  onUpdateVehicle={updateVehicle}
                />
              </div>

              <div className="lg:col-span-5">
                <VehicleDetails
                  vehicle={selectedVehicle || null}
                  driverName={selectedVehicle?.currentDriverId ? getDriverName(selectedVehicle.currentDriverId) : null}
                  assignments={selectedVehicleId ? getDriverAssignmentsForVehicle(assignments, selectedVehicleId) : []}
                  getDriverName={getDriverName}
                  payments={selectedVehicleId ? getVehiclePayments(selectedVehicleId) : []}
                  oilChanges={selectedVehicleId ? getVehicleOilChanges(selectedVehicleId) : []}
                  gpsRecharges={selectedVehicleId ? getVehicleGPSRecharges(selectedVehicleId) : []}
                  expenses={selectedVehicleId ? getVehicleExpenses(selectedVehicleId) : []}
                  onDeletePayment={deletePayment}
                  onDeleteOilChange={deleteOilChange}
                  onDeleteGPSRecharge={deleteGPSRecharge}
                  onDeleteExpense={deleteExpense}
                  onEditPayment={startEditFromAnywhere(setEditingPayment)}
                  onEditOilChange={startEditFromAnywhere(setEditingOilChange)}
                  onEditGPSRecharge={startEditFromAnywhere(setEditingGPSRecharge)}
                  onEditExpense={startEditFromAnywhere(setEditingExpense)}
                />
              </div>

              <div className="lg:col-span-4">
                <RecentActivity
                  vehicles={vehicles}
                  payments={payments}
                  oilChanges={oilChanges}
                  gpsRecharges={gpsRecharges}
                  expenses={expenses}
                />
              </div>
            </div>
          </>
        )}

        {view === 'operations' && (
          <OperationsView
            operations={operations}
            vehicles={vehicles}
            drivers={drivers}
            getDriverName={getDriverName}
            currentUserRole={currentUser?.role}
          />
        )}

        {view === 'drivers' && (
          <DriversView
            drivers={drivers}
            vehicles={vehicles}
            assignments={assignments}
            onAddDriver={addDriver}
            onUpdateDriver={updateDriver}
            onDeleteDriver={deleteDriver}
            onAssignDriver={assignDriver}
            onEndAssignment={endAssignment}
            getDriverAssignments={getDriverAssignments}
            getDriverVehicles={getDriverVehicles}
          />
        )}

        {/* Footer */}
        <footer className="text-center py-4 border-t border-border mt-8">
          <p className="text-xs text-muted-foreground">
            FleetManager v1.1 - Gestion de flotte automobile
          </p>
        </footer>
      </main>
    </div>
  )
}

function getDriverAssignmentsForVehicle<T extends { vehicleId: string; startDate: string }>(
  assignments: T[],
  vehicleId: string
): T[] {
  return assignments
    .filter(a => a.vehicleId === vehicleId)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
}
