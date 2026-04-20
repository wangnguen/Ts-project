import bcrypt from 'bcrypt'
import { instanceToPlain } from 'class-transformer'

import { env } from '@common/config'
import { SALT_ROUNDS } from '@common/constants'
import { ConflictError, UnauthorizedError } from '@common/errors'
import { JWTService } from '@common/services'
import { AuthResponse, AuthUser, GoogleProfile } from '@common/types'

import AuthRepository from './auth.repository'
import { LoginBody, RegisterBody } from './dto'

class AuthService {
  static async login(dto: LoginBody): Promise<AuthResponse> {
    const existUser = await AuthRepository.findByEmailWithPassword(dto.email)
    if (!existUser || !existUser.password) {
      throw new UnauthorizedError('User or password is invalid')
    }

    const isPasswordValid: boolean = await AuthService.comparePassword(dto.password, existUser.password)
    if (!isPasswordValid) {
      throw new UnauthorizedError('User or password is invalid')
    }

    const accessToken = JWTService.generateAccessToken({
      sub: existUser.id,
      email: existUser.email,
      role: existUser.role
    })

    const refreshToken = JWTService.generateRefreshToken({
      sub: existUser.id
    })
    const refreshTokenHash = JWTService.hashRefreshToken(refreshToken)

    await Promise.all([
      AuthRepository.saveRefreshToken({
        tokenHash: refreshTokenHash,
        userId: existUser.id,
        expiresAt: new Date(Date.now() + Number(env.JWT_REFRESH_EXPIRES_IN) * 1000),
        absoluteExpiresAt: new Date(Date.now() + Number(env.MAX_SESSION_LIFETIME_IN) * 1000)
      }),
      AuthRepository.updateLastLogin(existUser.id),
      AuthRepository.deleteExpiredTokensForUser(existUser.id)
    ])

    const user = instanceToPlain(existUser) as AuthUser

    return { accessToken, refreshToken, user }
  }

  static async register(dto: RegisterBody): Promise<AuthUser> {
    const [existingEmail, existingUsername] = await Promise.all([
      AuthRepository.findByEmail(dto.email),
      AuthRepository.findByUsername(dto.username)
    ])

    if (existingEmail) {
      throw new ConflictError('Email is already in use')
    }

    if (existingUsername) {
      throw new ConflictError('Username is already in use')
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS)
    const newUser = await AuthRepository.create({ ...dto, password: hashedPassword })

    const user = instanceToPlain(newUser) as AuthUser

    return user
  }

  static async logout(refreshToken?: string): Promise<void> {
    const refreshTokenHash = JWTService.hashRefreshToken(refreshToken as string)
    await AuthRepository.deleteRefreshToken(refreshTokenHash)
  }

  static async refreshToken(
    refreshToken: string,
    userId: string
  ): Promise<Pick<AuthResponse, 'accessToken' | 'refreshToken'>> {
    const payload = { sub: userId }
    const refreshTokenHash = JWTService.hashRefreshToken(refreshToken)
    const storedToken = await AuthRepository.findRefreshToken(refreshTokenHash)
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    if (storedToken.absoluteExpiresAt < new Date()) {
      throw new UnauthorizedError('Session expired. Please login again.')
    }

    await AuthRepository.deleteRefreshTokenById(storedToken.id)

    const user = await AuthRepository.findById(payload.sub)
    if (!user) throw new UnauthorizedError('User not found')

    const accessToken = JWTService.generateAccessToken({ sub: user.id, email: user.email, role: user.role })
    const newRefreshToken = JWTService.generateRefreshToken({ sub: user.id })
    const newRefreshTokenHash = JWTService.hashRefreshToken(newRefreshToken)

    await AuthRepository.saveRefreshToken({
      tokenHash: newRefreshTokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + Number(env.JWT_REFRESH_EXPIRES_IN) * 1000),
      absoluteExpiresAt: storedToken.absoluteExpiresAt
    })

    return { accessToken, refreshToken: newRefreshToken }
  }

  static async handleGoogleCallback(googleProfile: GoogleProfile): Promise<AuthResponse> {
    let user = await AuthRepository.findByGoogleId(googleProfile.googleId)

    if (!user) {
      user = await AuthRepository.findByEmail(googleProfile.email)

      if (user) {
        const avatarUrl = googleProfile.avatarUrl ?? user.avatarUrl ?? null
        await AuthRepository.updateGoogleLink(user.id, {
          googleId: googleProfile.googleId,
          avatarUrl
        })
        user.googleId = googleProfile.googleId
        user.avatarUrl = avatarUrl
      } else {
        try {
          user = await AuthRepository.createOAuthUser({
            email: googleProfile.email,
            fullName: googleProfile.fullName,
            googleId: googleProfile.googleId,
            avatarUrl: googleProfile.avatarUrl ?? null
          })
        } catch {
          user = await AuthRepository.findByEmail(googleProfile.email)
          if (!user) throw new ConflictError('Failed to create user account')
          await AuthRepository.updateGoogleLink(user.id, {
            googleId: googleProfile.googleId,
            avatarUrl: googleProfile.avatarUrl ?? user.avatarUrl ?? null
          })
          user.googleId = googleProfile.googleId
          user.avatarUrl = googleProfile.avatarUrl ?? user.avatarUrl ?? null
        }
      }
    }

    const accessToken = JWTService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role
    })

    const refreshToken = JWTService.generateRefreshToken({ sub: user.id })
    const refreshTokenHash = JWTService.hashRefreshToken(refreshToken)

    await Promise.all([
      AuthRepository.saveRefreshToken({
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + Number(env.JWT_REFRESH_EXPIRES_IN) * 1000),
        absoluteExpiresAt: new Date(Date.now() + Number(env.MAX_SESSION_LIFETIME_IN) * 1000)
      }),
      AuthRepository.updateLastLogin(user.id),
      AuthRepository.deleteExpiredTokensForUser(user.id)
    ])

    const plainUser = instanceToPlain(user) as AuthUser

    return { accessToken, refreshToken, user: plainUser }
  }

  private static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }
}

export default AuthService
