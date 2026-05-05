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

export const EMAIL_TEMPLATE = {
  VERIFY_EMAIL: process.env.RESEND_VERIFY_TEMPLATE_ID!,
  RESET_PASSWORD: process.env.RESEND_RESET_PASSWORD_TEMPLATE_ID!
} as const

export const VERIFY_EMAIL_EXPIRE_MINUTES = Number(process.env.VERIFY_EMAIL_EXPIRE_MINUTES)
export const RESET_PASSWORD_EXPIRE_MINUTES = Number(process.env.RESET_PASSWORD_EXPIRE_MINUTES)
