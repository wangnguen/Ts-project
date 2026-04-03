import AppDataSource from '@databases/data-source'
import { RefreshToken } from '@entities/refresh-token.entity'
import { User } from '@entities/user.entity'
import { RegisterBody } from '@modules/auth/auth.dto'

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

  static saveRefreshToken(data: { token: string; userId: string; expiresAt: Date; absoluteExpiresAt: Date }) {
    const newRefreshToken = this.refreshTokenRepo.create(data)
    return this.refreshTokenRepo.save(newRefreshToken)
  }

  static findRefreshToken(token: string) {
    return this.refreshTokenRepo.findOne({ where: { token } })
  }

  static deleteRefreshToken(token: string) {
    return this.refreshTokenRepo.delete({ token })
  }

  static deleteAllRefreshTokensForUser(userId: string) {
    return this.refreshTokenRepo.delete({ userId })
  }

  static deleteExpiredTokensForUser(userId: string) {
    return this.refreshTokenRepo
      .createQueryBuilder()
      .delete()
      .where('user_id = :userId', { userId })
      .andWhere('expires_at < :now', { now: new Date() })
      .andWhere('absolute_expires_at < :now', { now: new Date() })
      .execute()
  }
}

export default AuthRepository
