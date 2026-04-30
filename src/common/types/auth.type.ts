import { UserRole } from '@common/constants'

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type AuthUser = {
  id: string
  username?: string | null
  email: string
  fullName: string
  role: UserRole
  avatarUrl?: string | null
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

export type GoogleTokenResponse = {
  access_token: string
  token_type: string
}

export type GoogleUserInfo = {
  id: string
  email: string
  verified_email: boolean
  name: string
  picture?: string
}

export type GoogleProfile = {
  googleId: string
  email: string
  fullName: string
  avatarUrl?: string | null
}
