import { UserRole } from '@entities/user.entity'

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
