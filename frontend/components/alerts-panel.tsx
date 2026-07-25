'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AlertTriangle, MapPin, Droplets, X } from 'lucide-react'
import { Alert } from '@/lib/types'

interface AlertsPanelProps {
  alerts: Alert[]
  onDismiss?: (id: string) => void
}

export function AlertsPanel({ alerts, onDismiss }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return null
  }

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy', { locale: fr })
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h2 className="text-sm font-semibold">Alertes ({alerts.length})</h2>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-3 rounded-lg ${
              alert.severity === 'danger' 
                ? 'bg-rose-50 border border-rose-200' 
                : 'bg-amber-50 border border-amber-200'
            }`}
          >
            {alert.type === 'gps_expiry' ? (
              <MapPin className={`w-4 h-4 mt-0.5 ${alert.severity === 'danger' ? 'text-rose-500' : 'text-amber-500'}`} />
            ) : (
              <Droplets className={`w-4 h-4 mt-0.5 ${alert.severity === 'danger' ? 'text-rose-500' : 'text-amber-500'}`} />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${alert.severity === 'danger' ? 'text-rose-700' : 'text-amber-700'}`}>
                {alert.vehicleName}
              </p>
              <p className={`text-xs ${alert.severity === 'danger' ? 'text-rose-600' : 'text-amber-600'}`}>
                {alert.message}
                {alert.type === 'gps_expiry' && ` - ${formatDate(alert.date)}`}
              </p>
            </div>
            {onDismiss && (
              <button 
                onClick={() => onDismiss(alert.id)}
                className="p-1 hover:bg-white/50 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
