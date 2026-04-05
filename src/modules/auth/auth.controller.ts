import env from '@common/config/env'
import { JWT_REFRESH_EXPIRES_IN_MS } from '@modules/auth/auth.constant'
import { LoginBody, RegisterBody } from '@modules/auth/auth.dto'
import AuthService from '@modules/auth/auth.service'
import { Request, Response } from 'express'

class AuthController {
  private static handleRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: JWT_REFRESH_EXPIRES_IN_MS
    })
  }

  static async login(req: Request, res: Response) {
    const body = req.body as LoginBody
    const { accessToken, refreshToken, user } = await AuthService.login(body)

    AuthController.handleRefreshTokenCookie(res, refreshToken)

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
    const refreshToken = req.cookies.refreshToken
    const { accessToken, refreshToken: newRefreshToken } = await AuthService.refreshToken(refreshToken)
    AuthController.handleRefreshTokenCookie(res, newRefreshToken)
    res.ok({ accessToken }, { message: 'Token refreshed successfully' })
  }
}

export default AuthController
