import AppDataSource from '@databases/data-source'
import { CreateUserBody, UpdateUserBody } from './user.dto'
import { User } from '@databases/entities/user.entity'

class UserRepository {
  static create(data: CreateUserBody) {
    return AppDataSource.getDataSource().getRepository(User).save(data)
  }
  static find() {
    return AppDataSource.getDataSource().getRepository(User).find()
  }
  static update(id: string, data: UpdateUserBody) {
    return AppDataSource.getDataSource().getRepository(User).update(id, data)
  }
  static delete(id: string) {
    return AppDataSource.getDataSource().getRepository(User).delete(id)
  }

  static findByUsername(username: string) {
    return AppDataSource.getDataSource().getRepository(User).findOne({ where: { username } })
  }

  static findById(id: string) {
    return AppDataSource.getDataSource().getRepository(User).findOne({ where: { id } })
  }
  static findByEmail(email: string) {
    return AppDataSource.getDataSource().getRepository(User).findOne({ where: { email } })
  }
}

export default UserRepository
