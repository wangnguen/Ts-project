import axios from 'axios'

import { env, logger } from '@common/config'
import { GOOGLE_AUTH } from '@common/constants'
import { UnauthorizedError } from '@common/errors'
import { GoogleTokenResponse, GoogleUserInfo } from '@common/types/auth.type'

class GoogleService {
  static async getProfileFromAuthCode(code: string) {
    try {
      const tokenResponse = await axios(GOOGLE_AUTH.VERIFY_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: env.GOOGLE_CALLBACK_URL,
          grant_type: 'authorization_code'
        }).toString()
      })

      const tokenData = tokenResponse.data as GoogleTokenResponse

      const userResponse = await axios(GOOGLE_AUTH.USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      })

      const userInfo = userResponse.data as GoogleUserInfo

      return {
        googleId: userInfo.id,
        email: userInfo.email,
        fullName: userInfo.name,
        avatarUrl: userInfo.picture || null
      }
    } catch (error) {
      logger.error(`Google OAuth failed ${error}`)
      throw new UnauthorizedError('Google authentication failed. Please try again.')
    }
  }
}

export default GoogleService
