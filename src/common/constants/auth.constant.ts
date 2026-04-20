export const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user'
} as const

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
export const GOOGLE_AUTH_SCOPE = ['openid', 'email', 'profile']
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
export const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'
