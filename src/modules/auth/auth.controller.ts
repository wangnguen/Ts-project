import { Request, Response } from 'express'

import GoogleService from '@common/services/google-auth.service'

import AuthService from './auth.service'
import { GoogleCallbackBody, LoginBody, RegisterBody, RefreshTokenBody } from './dto'

class AuthController {
  static async login(req: Request, res: Response) {
    const body = req.body as LoginBody
    const { accessToken, refreshToken, user } = await AuthService.login(body)

    return res.ok({ accessToken, refreshToken, user }, { message: 'Login successful' })
  }

  static async register(req: Request, res: Response) {
    const body = req.body as RegisterBody
    const user = await AuthService.register(body)

    return res.created({ user }, { message: 'Registration successful' })
  }

  static async logout(req: Request, res: Response) {
    const { refreshToken } = req.body as RefreshTokenBody
    await AuthService.logout(refreshToken)

    return res.ok(null, { message: 'Logout successful' })
  }

  static async refreshToken(req: Request, res: Response) {
    const userId = req.refreshUserId as string
    const oldRefreshToken = req.body.refreshToken
    const { accessToken, refreshToken: newRefreshToken } = await AuthService.refreshToken(oldRefreshToken, userId)

    return res.ok({ accessToken, refreshToken: newRefreshToken }, { message: 'Token refreshed successfully' })
  }

  static async getGoogleRedirectUrl(req: Request, res: Response) {
    const url = AuthService.createGoogleAuthUrl()

    return res.ok({ url }, { message: 'Google OAuth URL generated successfully' })
  }

  static async verifyGoogleCallback(req: Request, res: Response) {
    const body = req.body as GoogleCallbackBody

    const { email, fullName, googleId, avatarUrl } = await GoogleService.getProfileFromAuthCode(body.code)

    const { accessToken, refreshToken, user } = await AuthService.verifyGoogleCallback({
      email,
      fullName,
      googleId,
      avatarUrl
    })

    return res.ok({ accessToken, refreshToken, user }, { message: 'Google authentication successful' })
  }
}

export default AuthController
