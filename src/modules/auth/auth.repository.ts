import { RefreshToken } from '@entities/refresh-token.entity'
import { User } from '@entities/user.entity'

import AppDataSource from '@databases/data-source'

import { RegisterBody } from './dto'

class AuthRepository {
  private static get userRepo() {
    return AppDataSource.getDataSource().getRepository(User)
  }

  private static get refreshTokenRepo() {
    return AppDataSource.getDataSource().getRepository(RefreshToken)
  }

  static createUser(user: Omit<RegisterBody, 'confirmPassword'>) {
    const newUser = this.userRepo.create(user)
    return this.userRepo.save(newUser)
  }

  static createOAuthUser(data: { email: string; fullName: string; googleId: string; avatarUrl?: string | null }) {
    const newUser = this.userRepo.create(data)
    return this.userRepo.save(newUser)
  }

  static findByUsername(username: string) {
    return this.userRepo.findOne({ where: { username } })
  }

  static findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } })
  }

  static findByEmailWithPassword(email: string) {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne()
  }

  static findById(id: string) {
    return this.userRepo.findOne({ where: { id } })
  }

  static updateLastLogin(id: string) {
    return this.userRepo.update(id, { lastLoginAt: new Date() })
  }

  static saveRefreshToken(data: { tokenHash: string; userId: string; expiresAt: Date; absoluteExpiresAt: Date }) {
    const newRefreshToken = this.refreshTokenRepo.create({
      token: data.tokenHash,
      userId: data.userId,
      expiresAt: data.expiresAt,
      absoluteExpiresAt: data.absoluteExpiresAt
    })
    return this.refreshTokenRepo.save(newRefreshToken)
  }

  static findRefreshToken(tokenHash: string) {
    return this.refreshTokenRepo.findOne({ where: { token: tokenHash } })
  }

  static deleteRefreshToken(tokenHash: string) {
    return this.refreshTokenRepo.delete({ token: tokenHash })
  }

  static deleteRefreshTokenById(id: string) {
    return this.refreshTokenRepo.delete({ id })
  }

  static updateGoogleProfile(id: string, data: { avatarUrl?: string }) {
    return this.userRepo.update(id, data)
  }
}

export default AuthRepository
