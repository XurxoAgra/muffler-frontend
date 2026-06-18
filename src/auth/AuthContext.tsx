import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiFetch, setAccessToken, setUnauthorizedHandler } from '../lib/apiClient'
import type { AuthTokens, LoginRequest, LogoutRequest, RegisterRequest } from '../lib/types'

// Riesgo: guardar el JWT en localStorage/memoria lo expone a robo vía XSS
// (a diferencia de una cookie httpOnly). Se acepta porque no hay backend propio
// que pueda emitir cookies — el backend solo devuelve el token en el body.
const STORAGE_KEY = 'muffler.auth'

interface StoredAuth {
  accessToken: string
  refreshToken: string
}

interface AuthContextValue {
  isAuthenticated: boolean
  login: (data: LoginRequest, rememberMe: boolean) => Promise<void>
  register: (data: RegisterRequest, rememberMe: boolean) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessTokenState, setAccessTokenState] = useState<string | null>(null)
  const [refreshTokenState, setRefreshTokenState] = useState<string | null>(null)

  useEffect(() => {
    const stored = readStoredAuth()
    if (stored) {
      setAccessTokenState(stored.accessToken)
      setRefreshTokenState(stored.refreshToken)
      setAccessToken(stored.accessToken)
    }
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => clearSession())
  }, [])

  function persistSession(tokens: AuthTokens, rememberMe: boolean) {
    setAccessTokenState(tokens.access_token)
    setRefreshTokenState(tokens.refresh_token)
    setAccessToken(tokens.access_token)

    if (rememberMe) {
      const stored: StoredAuth = { accessToken: tokens.access_token, refreshToken: tokens.refresh_token }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function clearSession() {
    setAccessTokenState(null)
    setRefreshTokenState(null)
    setAccessToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  async function login(data: LoginRequest, rememberMe: boolean) {
    const tokens = await apiFetch<AuthTokens>('/api/auth/login', { method: 'POST', body: data })
    persistSession(tokens, rememberMe)
  }

  async function register(data: RegisterRequest, rememberMe: boolean) {
    const tokens = await apiFetch<AuthTokens>('/api/auth/register', { method: 'POST', body: data })
    persistSession(tokens, rememberMe)
  }

  async function logout() {
    if (refreshTokenState) {
      const body: LogoutRequest = { refresh_token: refreshTokenState }
      try {
        await apiFetch('/api/auth/logout', { method: 'POST', body, authenticated: true })
      } catch {
        // El servidor puede rechazar el logout (token ya caducado, red caída);
        // limpiamos la sesión local igualmente.
      }
    }
    clearSession()
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: accessTokenState !== null,
      login,
      register,
      logout,
    }),
    [accessTokenState, refreshTokenState],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
