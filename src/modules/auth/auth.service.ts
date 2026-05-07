import bcrypt from 'bcrypt'
import { instanceToPlain } from 'class-transformer'

import { env } from '@common/config'
import { GOOGLE_AUTH, SALT_ROUNDS } from '@common/constants'
import { ConflictError, UnauthorizedError } from '@common/errors'
import { JWTService } from '@common/services'
import { AuthResponse, AuthUser, GoogleProfile } from '@common/types'
import { generateOAuthState, consumeOAuthState } from '@common/utils/oauth-state.store'

import { User } from '@entities/user.entity'

import AuthRepository from './auth.repository'
import { LoginBody, RegisterBody } from './dto'

class AuthService {
  static async login(dto: LoginBody): Promise<AuthResponse> {
    const existingUser = await AuthRepository.findByEmailWithPassword(dto.email)
    if (!existingUser || !existingUser.password) {
      throw new UnauthorizedError('User or password is invalid')
    }

    const isPasswordValid: boolean = await AuthService.comparePassword(dto.password, existingUser.password)
    if (!isPasswordValid) {
      throw new UnauthorizedError('User or password is invalid')
    }

    const { accessToken, refreshToken } = await AuthService.generateTokens(existingUser)

    const user = instanceToPlain(existingUser) as AuthUser

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
    const newUser = await AuthRepository.createUser({ ...dto, password: hashedPassword })

    const user = instanceToPlain(newUser) as AuthUser

    return user
  }

  static async logout(refreshToken: string): Promise<void> {
    const refreshTokenHash = JWTService.hashRefreshToken(refreshToken)
    await AuthRepository.deleteRefreshToken(refreshTokenHash)
  }

  static async refreshToken(
    currentRefreshToken: string,
    userId: string
  ): Promise<Pick<AuthResponse, 'accessToken' | 'refreshToken'>> {
    const refreshTokenHash = JWTService.hashRefreshToken(currentRefreshToken)
    const storedToken = await AuthRepository.findRefreshToken(refreshTokenHash)
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    if (storedToken.absoluteExpiresAt < new Date()) {
      throw new UnauthorizedError('Session expired. Please login again.')
    }

    await AuthRepository.deleteRefreshTokenById(storedToken.id)

    const user = await AuthRepository.findById(userId)
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

  static createGoogleAuthUrl(): { url: string; state: string } {
    const state = generateOAuthState()
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      response_type: 'code',
      scope: GOOGLE_AUTH.SCOPE,
      prompt: 'select_account',
      state
    })
    return { url: `${GOOGLE_AUTH.URL}?${params.toString()}`, state }
  }

  static verifyOAuthState(state: string): void {
    if (!consumeOAuthState(state)) {
      throw new UnauthorizedError('Invalid or expired OAuth state. Please try again.')
    }
  }

  static async verifyGoogleCallback(profile: GoogleProfile): Promise<AuthResponse> {
    const existingUser = await AuthRepository.findByEmail(profile.email)

    if (existingUser) {
      if (existingUser.googleId && existingUser.googleId !== profile.googleId) {
        throw new UnauthorizedError('This email is already linked to a different Google account.')
      }

      if (!existingUser.googleId) {
        throw new ConflictError(
          'An account with this email already exists. Please log in with your password and link Google from your account settings.'
        )
      }

      await AuthRepository.updateGoogleProfile(existingUser.id, {
        avatarUrl: existingUser.avatarUrl ?? profile.avatarUrl ?? undefined
      })
      const { accessToken, refreshToken } = await AuthService.generateTokens(existingUser)
      const user = instanceToPlain(existingUser) as AuthUser
      return { accessToken, refreshToken, user }
    }

    const newUser = await AuthRepository.createOAuthUser({
      email: profile.email,
      fullName: profile.fullName,
      googleId: profile.googleId,
      avatarUrl: profile.avatarUrl
    })

    const { accessToken, refreshToken } = await AuthService.generateTokens(newUser)

    const user = instanceToPlain(newUser) as AuthUser

    return { accessToken, refreshToken, user }
  }

  private static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  private static async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = JWTService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role
    })

    const refreshToken = JWTService.generateRefreshToken({
      sub: user.id
    })
    const refreshTokenHash = JWTService.hashRefreshToken(refreshToken)

    await Promise.all([
      AuthRepository.saveRefreshToken({
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + Number(env.JWT_REFRESH_EXPIRES_IN) * 1000),
        absoluteExpiresAt: new Date(Date.now() + Number(env.MAX_SESSION_LIFETIME_IN) * 1000)
      }),
      AuthRepository.updateLastLogin(user.id)
    ])
    return { accessToken, refreshToken }
  }
}

export default AuthService
