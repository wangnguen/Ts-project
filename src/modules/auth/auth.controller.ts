import env from '@common/config/env'
import { LoginBody, RegisterBody } from '@modules/auth/auth.dto'
import AuthService from '@modules/auth/auth.service'
import { Request, Response } from 'express'

class AuthController {
  static async login(req: Request, res: Response) {
    const body = req.body as LoginBody
    const { accessToken, refreshToken, user } = await AuthService.login(body)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: env.JWT_REFRESH_EXPIRES_IN,
      path: '/api/v1/auth'
    })

    res.ok({ accessToken, user }, { message: 'Login successful' })
  }

  static async register(req: Request, res: Response) {
    const body = req.body as RegisterBody
    const user = await AuthService.register(body)
    res.created({ user }, { message: 'Registration successful' })
  }

  static async logout(req: Request, res: Response) {
    res.send('Logout successful')
  }
  static async refreshToken(req: Request, res: Response) {
    res.send('Token refreshed successfully')
  }
}

export default AuthController
