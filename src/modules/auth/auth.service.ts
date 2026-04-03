import env from '@common/config/env'
import { SALT_ROUNDS } from '@common/constants'
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
    const isExistingUser = await AuthRepository.findByEmailWithPassword(dto.email)
    if (!isExistingUser) {
      throw new UnauthorizedError('User or password is invalid')
    }

    const isPasswordValid: boolean = await AuthService.comparePassword(dto.password, isExistingUser.password)
    if (!isPasswordValid) {
      throw new UnauthorizedError('User or password is invalid')
    }

    const accessToken = TokenService.generateAccessToken({
      sub: isExistingUser.id,
      email: isExistingUser.email,
      role: isExistingUser.role
    })

    const refreshToken = TokenService.generateRefreshToken({
      sub: isExistingUser.id
    })

    const expiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRES_IN * 1000)

    Promise.all([
      AuthRepository.saveRefreshToken({
        token: refreshToken,
        userId: isExistingUser.id,
        expiresAt
      }),
      AuthRepository.updateLastLogin(isExistingUser.id)
    ])

    const user = getInfoData({
      fields: ['id', 'username', 'email', 'fullName', 'role', 'isVerified'],
      object: isExistingUser
    }) as AuthUser

    return { accessToken, refreshToken, user }
  }

  static async register(dto: RegisterBody): Promise<AuthUser> {
    const [isExistingEmail, isExistingUsername] = await Promise.all([
      AuthRepository.findByEmail(dto.email),
      AuthRepository.findByUsername(dto.username)
    ])

    if (isExistingEmail) {
      throw new ConflictError('Email is already in use')
    }

    if (isExistingUsername) {
      throw new ConflictError('Username is already in use')
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS)
    const newUser = await AuthRepository.create({ ...dto, password: hashedPassword })

    const user = getInfoData({
      fields: ['id', 'username', 'email', 'fullName', 'role', 'isVerified'],
      object: newUser
    }) as AuthUser

    return user
  }

  static async logout() {
    return 'logout'
  }
  static async refreshToken() {
    return 'refreshToken'
  }
}

export default AuthService
