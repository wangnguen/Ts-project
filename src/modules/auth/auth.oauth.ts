import crypto from 'crypto'

import { NextFunction, Request, Response } from 'express'

import { env } from '@common/config'
import { GOOGLE_AUTH_SCOPE, GOOGLE_AUTH_URL, GOOGLE_TOKEN_URL, GOOGLE_USERINFO_URL } from '@common/constants'
import { UnauthorizedError } from '@common/errors/'
import { GoogleTokenResponse, GoogleUserInfo } from '@common/types'

class AuthOAuth {
  static googleRedirect(_req: Request, res: Response) {
    const state = crypto.randomBytes(16).toString('hex')

    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000
    })

    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      response_type: 'code',
      scope: GOOGLE_AUTH_SCOPE.join(' '),
      prompt: 'select_account',
      state
    })
    res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`)
  }

  static async googleCallback(req: Request, res: Response, next: NextFunction) {
    const code = req.query['code'] as string | undefined
    const state = req.query['state'] as string | undefined
    const error = req.query['error'] as string | undefined
    const cookieState = req.cookies?.['oauth_state'] as string | undefined

    res.clearCookie('oauth_state')

    if (error) {
      return next(new UnauthorizedError(`Google OAuth error: ${error}`))
    }

    if (!state || !cookieState || state !== cookieState) {
      return next(new UnauthorizedError('Invalid or missing OAuth state'))
    }

    if (!code) {
      return next(new UnauthorizedError('Google authorization code is missing'))
    }

    try {
      const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: env.GOOGLE_CALLBACK_URL,
          grant_type: 'authorization_code'
        }).toString()
      })

      if (!tokenResponse.ok) {
        throw new UnauthorizedError('Failed to exchange authorization code with Google')
      }

      const tokenData = (await tokenResponse.json()) as GoogleTokenResponse

      const userResponse = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      })

      if (!userResponse.ok) {
        throw new UnauthorizedError('Failed to fetch user profile from Google')
      }

      const userInfo = (await userResponse.json()) as GoogleUserInfo

      if (!userInfo.email) {
        throw new UnauthorizedError('Google account does not have an associated email')
      }

      req.profileGoogle = {
        googleId: userInfo.id,
        email: userInfo.email,
        fullName: userInfo.name,
        avatarUrl: userInfo.picture
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}

export default AuthOAuth
