import env from '@common/config/env'

export const SALT_ROUNDS = 10
export const MAX_SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000
export const JWT_REFRESH_EXPIRES_IN_MS = Number(env.JWT_REFRESH_EXPIRES_IN) * 1000
