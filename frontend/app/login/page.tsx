'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapPin, Gauge, ShieldCheck, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { ApiError } from '@/lib/api-client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false)

  useEffect(() => {
    if (searchParams.get('expired') === '1') {
      setSessionExpiredNotice(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/')
    }
  }, [authLoading, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      router.replace('/')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? 'Email ou mot de passe incorrect.' : err.message)
      } else {
        setError('Impossible de se connecter. Verifiez votre connexion reseau.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* Panneau visuel - identite gestion de flotte */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[oklch(0.2_0.04_255)] p-12 text-white">
        {/* Fond : route stylisee + grille */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[oklch(0.55_0.2_250)] opacity-20 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-[oklch(0.65_0.2_145)] opacity-10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1.5">
            <img src="/logo-symbole.png" alt="Good Entrepreneur" className="h-full w-full object-contain" />
          </div>
          <span className="text-lg font-semibold tracking-tight">FleetManager</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-balance">
              Pilotez votre flotte en toute clarte
            </h1>
            <p className="text-white/70 text-base leading-relaxed max-w-md">
              Vehicules, chauffeurs, versements, vidanges et recharges GPS : toutes vos
              operations terrain centralisees et supervisees en temps reel.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur">
              <MapPin className="h-4 w-4 text-white/60 mb-2" />
              <p className="text-xs text-white/60 leading-snug">Suivi vehicules & affectations</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur">
              <Gauge className="h-4 w-4 text-white/60 mb-2" />
              <p className="text-xs text-white/60 leading-snug">Vue 360 sur les saisies</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-white/60 mb-2" />
              <p className="text-xs text-white/60 leading-snug">Acces securise par role</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} FleetManager — Gestion de flotte automobile
        </p>
      </div>

      {/* Panneau formulaire */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-4">
            <img src="/logo-symbole.png" alt="Good Entrepreneur" className="h-10 w-auto" />
            <span className="text-lg font-semibold tracking-tight">FleetManager</span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-semibold tracking-tight">Connexion</h2>
            <p className="text-sm text-muted-foreground">
              Accedez a votre espace agent, superviseur ou administrateur.
            </p>
          </div>

          {sessionExpiredNotice && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Votre session a expire. Veuillez vous reconnecter.</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="prenom.nom@fleetmanager.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={submitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Acces reserve au personnel autorise. Contactez votre administrateur en cas d&apos;oubli
            de mot de passe.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
