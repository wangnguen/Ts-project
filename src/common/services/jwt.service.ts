import { createHmac } from 'node:crypto'

import jwt from 'jsonwebtoken'

import env from '@common/config/env'
import { AccessTokenPayload, RefreshTokenPayload, TwoFactorTokenPayload } from '@common/types'

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

  static hashRefreshToken(token: string): string {
    return createHmac('sha256', env.REFRESH_TOKEN_HASH_SECRET).update(token).digest('hex')
  }

  static generateTwoFactorToken(payload: Pick<TwoFactorTokenPayload, 'sub'>): string {
    return jwt.sign({ sub: payload.sub, type: '2fa-pending' }, env.JWT_2FA_SECRET, {
      expiresIn: env.JWT_2FA_EXPIRES_IN
    })
  }

  static verifyTwoFactorToken(token: string): TwoFactorTokenPayload {
    return jwt.verify(token, env.JWT_2FA_SECRET) as TwoFactorTokenPayload
  }
}

export default TokenService
