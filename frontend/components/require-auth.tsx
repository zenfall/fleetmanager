'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Truck } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

/** Bloque l'affichage tant que la session n'est pas verifiee, redirige vers /login si absente. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Truck className="h-6 w-6" />
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
