import bcrypt from 'bcrypt'
import { instanceToPlain } from 'class-transformer'

import { SALT_ROUNDS } from '@common/constants'
import { ConflictError, NotFoundError, UnauthorizedError } from '@common/errors'

import { UpdateUserBody, UpdateUserPasswordBody } from './dto'
import UserRepository from './user.repository'

class UserService {
  static async getUserInfo(id: string) {
    const user = await UserRepository.getUserById(id)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    const plainUser = instanceToPlain(user)

    return plainUser
  }

  static async updateUserInfo(id: string, dto: UpdateUserBody) {
    const user = await UserRepository.getUserById(id)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    const userWithSameUsername = dto.username && (await UserRepository.getUserByUsername(dto.username))
    if (userWithSameUsername && userWithSameUsername.id !== id) {
      throw new ConflictError('Username already taken')
    }

    await UserRepository.updateUser(id, dto)

    const updatedUser = await UserRepository.getUserById(id)
    if (!updatedUser) {
      throw new NotFoundError('User not found')
    }

    const plainUpdatedUser = instanceToPlain(updatedUser)
    return plainUpdatedUser
  }
  static async updateUserPassword(id: string, dto: UpdateUserPasswordBody) {
    const user = await UserRepository.getUserWithPassword(id)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    const isCurrentPasswordValid = await this.comparePassword(dto.currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect')
    }
    const newPasswordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS)
    await UserRepository.updateUserPassword(id, newPasswordHash)
  }

  static async deleteUser(id: string) {
    const result = await UserRepository.softDeleteUser(id)
    if (!result.affected) {
      throw new NotFoundError('User not found')
    }
  }

  private static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }
}

export default UserService
