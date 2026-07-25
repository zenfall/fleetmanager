'use client'

/**
 * Stockage des tokens JWT (access + refresh) et de l'heure d'expiration.
 * Centralise pour que api-client.ts et auth-context.tsx restent synchronises.
 */

const KEYS = {
  accessToken: 'fleet_access_token',
  refreshToken: 'fleet_refresh_token',
  expiresAt: 'fleet_expires_at'
}

export interface StoredTokens {
  accessToken: string
  refreshToken: string
  /** Timestamp (ms epoch) d'expiration de l'access token. */
  expiresAt: number
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(KEYS.accessToken)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(KEYS.refreshToken)
}

export function getExpiresAt(): number | null {
  if (typeof window === 'undefined') return null
  const value = localStorage.getItem(KEYS.expiresAt)
  return value ? parseInt(value, 10) : null
}

export function setTokens(tokens: StoredTokens): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEYS.accessToken, tokens.accessToken)
  localStorage.setItem(KEYS.refreshToken, tokens.refreshToken)
  localStorage.setItem(KEYS.expiresAt, String(tokens.expiresAt))
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEYS.accessToken)
  localStorage.removeItem(KEYS.refreshToken)
  localStorage.removeItem(KEYS.expiresAt)
}

export function isExpired(): boolean {
  const expiresAt = getExpiresAt()
  if (!expiresAt) return true
  return Date.now() >= expiresAt
}
