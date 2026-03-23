import { CreateUserBody, UpdateUserBody, UuidParam } from '@modules/users/user.dto'
import UserService from '@modules/users/user.service'
import { Request, Response } from 'express'

class UserController {
  static async createUser(req: Request, res: Response) {
    const { username, email, password } = req.body as CreateUserBody
    await UserService.createUser({ username, email, password })
    res.created(null, { message: `User ${username} created successfully` })
  }

  static async getUsers(_req: Request, res: Response) {
    const users = await UserService.getUsers()
    res.ok(users, { message: 'Users fetched successfully' })
  }

  static async updateUser(req: Request, res: Response) {
    const { id } = req.params as UuidParam
    await UserService.updateUser(id, req.body as UpdateUserBody)
    res.ok(null, { message: 'User updated successfully' })
  }

  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params as UuidParam
    await UserService.deleteUser(id)
    res.ok(null, { message: 'User deleted successfully' })
  }

  static async getUserById(req: Request, res: Response) {
    const { id } = req.params as UuidParam
    const user = await UserService.getUserById(id)
    res.ok(user, { message: 'User fetched successfully' })
  }
}

export default UserController
