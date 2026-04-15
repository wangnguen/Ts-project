import UserService from '@modules/user/user.service'
import { Request, Response } from 'express'

class UserController {
  static async getUserInfo(req: Request, res: Response) {
    const userId = req.user?.id as string
    const user = await UserService.getUserInfo(userId)
    res.ok(user)
  }
}

export default UserController
