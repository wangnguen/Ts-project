import env from '@common/config/env'
import jwt from 'jsonwebtoken'

export type AccessTokenPayload = {
  sub: string
  email: string
  role: string
}

export type RefreshTokenPayload = {
  sub: string
}

class TokenService {
  static generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN
    })
  }

  static generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN
    })
  }

  static verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload
  }
}

export default TokenService
