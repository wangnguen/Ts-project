import { NotFoundError } from '@common/errors'
import UserRepository from '@modules/user/user.repository'

class UserService {
  static async getUserInfo(id: string) {
    const user = await UserRepository.getUserById(id)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    return user
  }
}

export default UserService
