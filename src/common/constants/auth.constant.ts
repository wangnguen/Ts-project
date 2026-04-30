export const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user'
} as const

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]

export const GOOGLE_AUTH = {
  URL: 'https://accounts.google.com/o/oauth2/v2/auth',
  SCOPE: ['openid', 'email', 'profile'].join(' '),
  VERIFY_TOKEN_URL: 'https://oauth2.googleapis.com/token',
  USERINFO_URL: 'https://www.googleapis.com/oauth2/v2/userinfo'
}
