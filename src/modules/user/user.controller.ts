import { Request, Response } from 'express'
import UserService from '@modules/user/user.service'
import { UpdateUserBody, UpdateUserPasswordBody } from './dto'

class UserController {
  static async getUserInfo(req: Request, res: Response) {
    const userId = req.user?.id as string
    const user = await UserService.getUserInfo(userId)
    res.ok(user)
  }

  static async updateUserInfo(req: Request, res: Response) {
    const userId = req.user?.id as string
    const updateData = req.body as UpdateUserBody
    const updatedUser = await UserService.updateUserInfo(userId, updateData)
    res.ok(updatedUser)
  }

  static async updateUserPassword(req: Request, res: Response) {
    const userId = req.user?.id as string
    const dto = req.body as UpdateUserPasswordBody
    await UserService.updateUserPassword(userId, dto)
    res.ok({ message: 'Password updated successfully' })
  }

  static async deleteUser(req: Request, res: Response) {
    await UserService.deleteUser(req.user?.id as string)
    res.ok({ message: 'User deleted successfully' })
  }
}

export default UserController
