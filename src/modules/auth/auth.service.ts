import { JWT_REFRESH_EXPIRES_IN_MS, MAX_SESSION_LIFETIME_MS, SALT_ROUNDS } from '@common/constants'
import { ConflictError, UnauthorizedError } from '@common/errors/app.error'
import { getInfoData } from '@common/utils'
import { LoginBody, RegisterBody } from '@modules/auth/auth.dto'
import AuthRepository from '@modules/auth/auth.repository'
import { AuthResponse, AuthUser } from '@modules/auth/auth.types'
import TokenService from '@modules/auth/token.service'
import bcrypt from 'bcrypt'

class AuthService {
  private static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static async login(dto: LoginBody): Promise<AuthResponse> {
    const existUser = await AuthRepository.findByEmailWithPassword(dto.email)
    if (!existUser) {
      throw new UnauthorizedError('User or password is invalid')
    }

    const isPasswordValid: boolean = await AuthService.comparePassword(dto.password, existUser.password)
    if (!isPasswordValid) {
      throw new UnauthorizedError('User or password is invalid')
    }

    const accessToken = TokenService.generateAccessToken({
      sub: existUser.id,
      email: existUser.email,
      role: existUser.role
    })

    const refreshToken = TokenService.generateRefreshToken({
      sub: existUser.id
    })

    await Promise.all([
      AuthRepository.saveRefreshToken({
        token: refreshToken,
        userId: existUser.id,
        expiresAt: new Date(Date.now() + JWT_REFRESH_EXPIRES_IN_MS),
        absoluteExpiresAt: new Date(Date.now() + MAX_SESSION_LIFETIME_MS)
      }),
      AuthRepository.updateLastLogin(existUser.id),
      AuthRepository.deleteExpiredTokensForUser(existUser.id)
    ])

    const user = getInfoData({
      fields: ['id', 'username', 'email', 'fullName', 'role', 'isVerified'],
      object: existUser
    })

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

    const user = getInfoData({
      fields: ['id', 'username', 'email', 'fullName', 'role', 'isVerified'],
      object: newUser
    })

    return user
  }

  static async logout(refreshToken: string): Promise<void> {
    await AuthRepository.deleteRefreshToken(refreshToken)
  }

  static async refreshToken(refreshToken: string): Promise<Pick<AuthResponse, 'accessToken' | 'refreshToken'>> {
    let payload: { sub: string }
    try {
      payload = TokenService.verifyRefreshToken(refreshToken)
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    const storedToken = await AuthRepository.findRefreshToken(refreshToken)
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token has been revoked or expired')
    }

    if (storedToken.absoluteExpiresAt < new Date()) {
      throw new UnauthorizedError('Session expired. Please login again.')
    }

    await AuthRepository.deleteRefreshToken(refreshToken)

    const user = await AuthRepository.findById(payload.sub)
    if (!user) throw new UnauthorizedError('User not found')

    const accessToken = TokenService.generateAccessToken({ sub: user.id, email: user.email, role: user.role })
    const newRefreshToken = TokenService.generateRefreshToken({ sub: user.id })

    const expiresAt = new Date(Date.now() + JWT_REFRESH_EXPIRES_IN_MS)
    await AuthRepository.saveRefreshToken({
      token: newRefreshToken,
      userId: user.id,
      expiresAt,
      absoluteExpiresAt: storedToken.absoluteExpiresAt
    })

    return { accessToken, refreshToken: newRefreshToken }
  }
}

export default AuthService
