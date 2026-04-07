import env from '@common/config/env'
import AuthService from '@modules/auth/auth.service'
import { LoginBody, RegisterBody } from '@modules/auth/dto'
import { Request, Response } from 'express'

class AuthController {
  static async login(req: Request, res: Response) {
    const body = req.body as LoginBody
    const { accessToken, refreshToken, user } = await AuthService.login(body)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.JWT_REFRESH_EXPIRES_IN * 1000
    })

    res.ok({ accessToken, user }, { message: 'Login successful' })
  }

  static async register(req: Request, res: Response) {
    const body = req.body as RegisterBody
    const user = await AuthService.register(body)

    res.created({ user }, { message: 'Registration successful' })
  }

  static async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken
    await AuthService.logout(refreshToken)
    res.clearCookie('refreshToken')

    res.ok(null, { message: 'Logout successful' })
  }

  static async refreshToken(req: Request, res: Response) {
    const userId = req.refreshUserId as string
    const refreshToken = req.cookies.refreshToken
    const { accessToken, refreshToken: newRefreshToken } = await AuthService.refreshToken(refreshToken, userId)
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.JWT_REFRESH_EXPIRES_IN * 1000
    })

    res.ok({ accessToken }, { message: 'Token refreshed successfully' })
  }
}

export default AuthController
