'use client'

import { Car, TrendingUp, TrendingDown, Droplets, MapPin, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface StatsCardsProps {
  vehicleCount: number
  activeVehicles: number
  monthlyPayments: number
  monthlyExpenses: number
  totalOilChanges: number
  totalGPSRecharges: number
}

export function StatsCards({ 
  vehicleCount, 
  activeVehicles, 
  monthlyPayments, 
  monthlyExpenses,
  totalOilChanges,
  totalGPSRecharges
}: StatsCardsProps) {
  const balance = monthlyPayments - monthlyExpenses
  const isProfit = balance >= 0
  const profitPercentage = monthlyPayments > 0 
    ? Math.round((balance / monthlyPayments) * 100) 
    : 0

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M FCFA'
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K FCFA'
    }
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  const formatFullCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      {/* Vehicles */}
      <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Car className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
            {activeVehicles} actifs
          </span>
        </div>
        <p className="text-2xl font-bold text-foreground">{vehicleCount}</p>
        <p className="text-xs text-muted-foreground mt-1">Vehicules total</p>
      </div>

      {/* Monthly Payments */}
      <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-center gap-1 text-emerald-600">
            <ArrowUpRight className="w-3 h-3" />
            <span className="text-xs font-medium">Recettes</span>
          </div>
        </div>
        <p className="text-xl font-bold text-emerald-600" title={formatFullCurrency(monthlyPayments)}>
          {formatCurrency(monthlyPayments)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Versements du mois</p>
      </div>

      {/* Monthly Expenses */}
      <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-rose-600" />
          </div>
          <div className="flex items-center gap-1 text-rose-600">
            <ArrowDownRight className="w-3 h-3" />
            <span className="text-xs font-medium">Charges</span>
          </div>
        </div>
        <p className="text-xl font-bold text-rose-600" title={formatFullCurrency(monthlyExpenses)}>
          {formatCurrency(monthlyExpenses)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Depenses du mois</p>
      </div>

      {/* Balance */}
      <div className={`rounded-xl border p-4 hover:shadow-md transition-shadow ${
        isProfit 
          ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200' 
          : 'bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isProfit ? 'bg-emerald-200' : 'bg-rose-200'
          }`}>
            <Wallet className={`w-5 h-5 ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`} />
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            isProfit 
              ? 'bg-emerald-200 text-emerald-700' 
              : 'bg-rose-200 text-rose-700'
          }`}>
            {isProfit ? '+' : ''}{profitPercentage}%
          </span>
        </div>
        <p className={`text-xl font-bold ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`} 
           title={formatFullCurrency(Math.abs(balance))}>
          {isProfit ? '+' : '-'}{formatCurrency(Math.abs(balance))}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isProfit ? 'Benefice' : 'Deficit'} du mois
        </p>
      </div>

      {/* Oil Changes */}
      <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground">{totalOilChanges}</p>
        <p className="text-xs text-muted-foreground mt-1">Vidanges ce mois</p>
      </div>

      {/* GPS Recharges */}
      <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-cyan-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground">{totalGPSRecharges}</p>
        <p className="text-xs text-muted-foreground mt-1">Recharges GPS ce mois</p>
      </div>
    </div>
  )
}
