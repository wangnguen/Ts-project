import {
  JWT_ACCESS_EXPIRES_IN_SECONDS,
  JWT_REFRESH_EXPIRES_IN_SECONDS,
  JWT_REFRESH_SECRET,
  JWT_SECRET
} from '@modules/auth/auth.constant'
import jwt from 'jsonwebtoken'
import { createHmac } from 'node:crypto'

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
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES_IN_SECONDS
    })
  }

  static generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN_SECONDS
    })
  }

  static verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, JWT_SECRET) as AccessTokenPayload
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload
  }

  static hashRefreshToken = (token: string): string => {
    return createHmac('sha256', JWT_REFRESH_SECRET).update(token).digest('hex')
  }
}

export default TokenService
