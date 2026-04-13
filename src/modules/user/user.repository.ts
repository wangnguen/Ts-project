import AppDataSource from '@databases/data-source'
import { User } from '@entities/user.entity'

class UserRepository {
  static getUserById(id: string) {
    return this.userRepo.findOne({ where: { id } })
  }

  private static get userRepo() {
    return AppDataSource.getDataSource().getRepository(User)
  }
}

export default UserRepository
