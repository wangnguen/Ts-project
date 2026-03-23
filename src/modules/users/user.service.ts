import { SALT_ROUNDS } from '@common/constants'
import { ConflictError, NotFoundError } from '@common/errors/app.error'
import { User } from '@entities/user.entity'
import { CreateUserBody, UpdateUserBody } from '@modules/users/user.dto'
import UserRepository from '@modules/users/user.repository'
import bcrypt from 'bcrypt'

class UserService {
  static async createUser(data: CreateUserBody): Promise<void> {
    const existingUser = await UserRepository.findByUsername(data.username)
    if (existingUser) {
      throw new ConflictError('Username already exists')
    }

    const existingUserByEmail = await UserRepository.findByEmail(data.email)
    if (existingUserByEmail) {
      throw new ConflictError('Email already exists')
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS)

    await UserRepository.create({ ...data, password: hashedPassword })
  }

  static async getUsers(): Promise<User[]> {
    return UserRepository.find()
  }

  static async updateUser(id: string, data: UpdateUserBody): Promise<void> {
    const existingUser = await UserRepository.findById(id)
    if (!existingUser) {
      throw new NotFoundError('User not found')
    }

    if (data.username) {
      const existingUserByUsername = await UserRepository.findByUsername(data.username)
      if (existingUserByUsername && existingUserByUsername.id !== existingUser.id) {
        throw new ConflictError('Username already exists')
      }
    }

    if (data.email) {
      const existingUserByEmail = await UserRepository.findByEmail(data.email)
      if (existingUserByEmail && existingUserByEmail.id !== existingUser.id) {
        throw new ConflictError('Email already exists')
      }
    }

    const updateData = { ...data }
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS)
    }

    await UserRepository.update(id, updateData)
  }

  static async deleteUser(id: string) {
    const result = await UserRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundError('User not found')
    }
    return result
  }

  static async getUserById(id: string): Promise<User> {
    const existingUser = await UserRepository.findById(id)
    if (!existingUser) {
      throw new NotFoundError('User not found')
    }
    return existingUser
  }
}

export default UserService
