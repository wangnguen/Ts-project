import { Brackets, In } from 'typeorm'

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

  static create(user: Omit<RegisterBody, 'confirmPassword'>) {
    const newUser = this.userRepo.create(user)
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
    const tokenCandidates = [tokenHash]
    return this.refreshTokenRepo.findOne({ where: { token: In(tokenCandidates) } })
  }

  static deleteRefreshToken(tokenHash: string) {
    const tokenCandidates = [tokenHash]
    return this.refreshTokenRepo.delete({ token: In(tokenCandidates) })
  }

  static deleteRefreshTokenById(id: string) {
    return this.refreshTokenRepo.delete({ id })
  }

  static deleteExpiredTokensForUser(userId: string) {
    return this.refreshTokenRepo
      .createQueryBuilder()
      .delete()
      .where('user_id = :userId', { userId })
      .andWhere(new Brackets((qb) => qb.where('expires_at < :now').orWhere('absolute_expires_at < :now')), {
        now: new Date()
      })
      .execute()
  }
}

export default AuthRepository
