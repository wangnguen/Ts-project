import AppDataSource from '@databases/data-source'
import { CreateUserBody, UpdateUserBody } from './user.dto'
import { User } from '@entities/user.entity'

class UserRepository {
  private static get repo() {
    return AppDataSource.getDataSource().getRepository(User)
  }

  static create(data: CreateUserBody) {
    return this.repo.save(data)
  }
  static find() {
    return this.repo.find()
  }
  static update(id: string, data: UpdateUserBody) {
    return this.repo.update(id, data)
  }
  static delete(id: string) {
    return this.repo.delete(id)
  }

  static findByUsername(username: string) {
    return this.repo.findOne({ where: { username } })
  }

  static findById(id: string) {
    return this.repo.findOne({ where: { id } })
  }
  static findByEmail(email: string) {
    return this.repo.findOne({ where: { email } })
  }
}

export default UserRepository
