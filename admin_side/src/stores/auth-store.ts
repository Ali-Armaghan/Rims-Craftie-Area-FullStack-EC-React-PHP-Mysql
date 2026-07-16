import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import {
  ADMIN_SESSION_TOKEN,
  createAdminSessionUser,
  isValidAdminSession,
  type AdminSessionUser,
} from '@/lib/admin-auth'

const ACCESS_TOKEN = 'ateeqo_admin_access_token'
const AUTH_USER = 'ateeqo_admin_user'

interface AuthState {
  auth: {
    user: AdminSessionUser | null
    setUser: (user: AdminSessionUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
    isAuthenticated: () => boolean
  }
}

function readCookieJson<T>(name: string): T | null {
  const raw = getCookie(name)
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(raw)) as T
  } catch {
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const initToken = readCookieJson<string>(ACCESS_TOKEN) ?? ''
  const initUser = readCookieJson<AdminSessionUser>(AUTH_USER)

  const validSession = isValidAdminSession(initToken, initUser)
  const bootToken = validSession ? ADMIN_SESSION_TOKEN : ''
  const bootUser = validSession ? initUser ?? createAdminSessionUser() : null

  if (!validSession) {
    removeCookie(ACCESS_TOKEN)
    removeCookie(AUTH_USER)
  }

  return {
    auth: {
      user: bootUser,
      setUser: (user) =>
        set((state) => {
          if (user) {
            setCookie(AUTH_USER, encodeURIComponent(JSON.stringify(user)))
          } else {
            removeCookie(AUTH_USER)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: bootToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, encodeURIComponent(JSON.stringify(accessToken)))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(AUTH_USER)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
      isAuthenticated: () => {
        const { accessToken, user } = get().auth
        return isValidAdminSession(accessToken, user)
      },
    },
  }
})
