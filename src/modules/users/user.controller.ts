import { CreateUserBody, UpdateUserBody } from '@modules/users/user.dto'
import UserService from '@modules/users/user.service'
import { Request, Response } from 'express'

class UserController {
  static async createUser(req: Request, res: Response) {
    const { username, email, password, role } = req.body as CreateUserBody
    await UserService.createUser({ username, email, password, role })
    res.created({ message: `User ${username} created successfully` })
  }

  static async getUsers(_req: Request, res: Response) {
    const users = await UserService.getUsers()
    res.ok({ data: users, message: 'Users fetched successfully' })
  }

  static async updateUser(req: Request, res: Response) {
    const { id } = req.params
    const user = await UserService.updateUser(id as string, req.body as UpdateUserBody)
    res.ok({ data: user, message: 'User updated successfully' })
  }

  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params
    await UserService.deleteUser(id as string)
    res.ok({ message: 'User deleted successfully' })
  }

  static async getUserById(req: Request, res: Response) {
    const { id } = req.params
    const user = await UserService.getUserById(id as string)
    res.ok({ data: user, message: 'User fetched successfully' })
  }
}

export default UserController
