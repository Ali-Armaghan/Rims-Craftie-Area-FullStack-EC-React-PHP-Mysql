export const ADMIN_CREDENTIALS = {
  email: 'ateeq@gmail.com',
  password: '55105510',
} as const

export const ADMIN_SESSION_TOKEN = 'ateeqo-admin-hardcoded-session'

export type AdminSessionUser = {
  accountNo: string
  email: string
  role: string[]
  exp: number
}

export function validateAdminCredentials(email: string, password: string) {
  return (
    email.trim().toLowerCase() === ADMIN_CREDENTIALS.email &&
    password === ADMIN_CREDENTIALS.password
  )
}

export function createAdminSessionUser(): AdminSessionUser {
  return {
    accountNo: 'admin-1',
    email: ADMIN_CREDENTIALS.email,
    role: ['admin'],
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  }
}

export function isValidAdminSession(
  accessToken: string | null | undefined,
  user?: AdminSessionUser | null
) {
  if (!accessToken || accessToken !== ADMIN_SESSION_TOKEN) {
    return false
  }

  if (user && user.exp < Date.now()) {
    return false
  }

  return true
}
