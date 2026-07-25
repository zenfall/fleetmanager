'use client'

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './token-storage'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const SESSION_EXPIRED_EVENT = 'fleet:session-expired'

export class ApiError extends Error {
  status: number
  details?: string[]

  constructor(message: string, status: number, details?: string[]) {
    super(message)
    this.status = status
    this.details = details
  }
}

function notifySessionExpired() {
  clearTokens()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
  }
}

let refreshPromise: Promise<boolean> | null = null

/** Tente un rafraichissement du token (une seule requete en vol a la fois). */
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })
      .then(async (res) => {
        if (!res.ok) return false
        const data = await res.json()
        setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt
        })
        return true
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

interface ApiFetchOptions extends RequestInit {
  /** Ne pas tenter d'attacher un token (utilise pour /api/auth/login). */
  skipAuth?: boolean
  /** Ne pas tenter de refresh automatique en cas de 401 (evite les boucles). */
  skipRefreshRetry?: boolean
}

/**
 * Wrapper fetch pour l'API FleetManager.
 * - Attache automatiquement le token JWT
 * - Si le serveur repond 401 (session expiree/invalide), tente un refresh silencieux une fois
 * - Si le refresh echoue aussi, declenche SESSION_EXPIRED_EVENT pour deconnecter l'utilisateur
 */
export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipAuth, skipRefreshRetry, headers, ...rest } = options

  const doFetch = async (): Promise<Response> => {
    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>)
    }
    if (!skipAuth) {
      const token = getAccessToken()
      if (token) finalHeaders['Authorization'] = `Bearer ${token}`
    }
    return fetch(`${API_BASE_URL}${path}`, { ...rest, headers: finalHeaders })
  }

  let response = await doFetch()

  if (response.status === 401 && !skipAuth && !skipRefreshRetry) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      response = await doFetch()
    } else {
      notifySessionExpired()
      throw new ApiError('Session expiree, veuillez vous reconnecter', 401)
    }
  }

  if (response.status === 401 && !skipAuth) {
    notifySessionExpired()
    throw new ApiError('Session expiree, veuillez vous reconnecter', 401)
  }

  if (!response.ok) {
    let message = `Erreur ${response.status}`
    let details: string[] | undefined
    try {
      const body = await response.json()
      message = body.message || message
      details = body.details
    } catch {
      // reponse sans corps JSON
    }
    throw new ApiError(message, response.status, details)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>
  }
  return response.text() as unknown as Promise<T>
}

export const api = {
  get: <T = unknown>(path: string) => apiFetch<T>(path, { method: 'GET' }),
  post: <T = unknown>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T = unknown>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T = unknown>(path: string) => apiFetch<T>(path, { method: 'DELETE' })
}
