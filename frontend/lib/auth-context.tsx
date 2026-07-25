'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from './types'
import { api, apiFetch, ApiError, SESSION_EXPIRED_EVENT } from './api-client'
import { clearTokens, getAccessToken, getExpiresAt, setTokens } from './token-storage'

interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: User
}

interface AuthContextValue {
  currentUser: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: (reason?: 'manual' | 'expired') => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearExpiryTimer = useCallback(() => {
    if (expiryTimer.current) {
      clearTimeout(expiryTimer.current)
      expiryTimer.current = null
    }
  }, [])

  const logout = useCallback((reason: 'manual' | 'expired' = 'manual') => {
    clearExpiryTimer()
    clearTokens()
    setCurrentUser(null)
    const suffix = reason === 'expired' ? '?expired=1' : ''
    router.push(`/login${suffix}`)
  }, [router, clearExpiryTimer])

  /** Programme la deconnexion automatique a l'instant precis d'expiration du token. */
  const scheduleExpiryCheck = useCallback(() => {
    clearExpiryTimer()
    const expiresAt = getExpiresAt()
    if (!expiresAt) return

    const delay = Math.max(expiresAt - Date.now(), 0)
    expiryTimer.current = setTimeout(async () => {
      // A l'expiration : tente un refresh silencieux, sinon deconnexion automatique.
      try {
        await apiFetch('/api/auth/me')
        scheduleExpiryCheck()
      } catch {
        logout('expired')
      }
    }, delay)
  }, [clearExpiryTimer, logout])

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<AuthResponse>('/api/auth/login', { email, password })
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken, expiresAt: data.expiresAt })
    setCurrentUser(data.user)
    scheduleExpiryCheck()
  }, [scheduleExpiryCheck])

  // Initialisation : restaure la session si un token valide est present.
  useEffect(() => {
    let cancelled = false

    async function init() {
      const token = getAccessToken()
      if (!token) {
        setIsLoading(false)
        return
      }
      try {
        const user = await apiFetch<User>('/api/auth/me')
        if (!cancelled) {
          setCurrentUser(user)
          scheduleExpiryCheck()
        }
      } catch {
        if (!cancelled) clearTokens()
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ecoute les 401 remontes par api-client (session expiree cote serveur) pour deconnecter partout.
  useEffect(() => {
    const handler = () => logout('expired')
    window.addEventListener(SESSION_EXPIRED_EVENT, handler)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler)
  }, [logout])

  useEffect(() => clearExpiryTimer, [clearExpiryTimer])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated: !!currentUser,
        login,
        logout: (reason) => logout(reason)
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit etre utilise a l\'interieur de <AuthProvider>')
  return ctx
}

export { ApiError }
