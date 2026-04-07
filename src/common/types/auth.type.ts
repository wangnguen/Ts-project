import { UserRole } from '@common/constants'

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type AuthUser = {
  id: string
  username: string
  email: string
  fullName: string
  role: UserRole
  isVerified: boolean
}

export type AuthResponse = AuthTokens & {
  user: AuthUser
}

export type AccessTokenPayload = {
  sub: string
  email: string
  role: string
}

export type RefreshTokenPayload = {
  sub: string
}
