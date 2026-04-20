import { Router } from 'express'

import { AuthMiddleware, authRateLimiterMiddleware, validateBody } from '@common/middlewares'

import AuthController from './auth.controller'
import { LoginBodySchema, RegisterBodySchema, RefreshTokenBodySchema, GoogleCallbackBodySchema } from './dto'

const router = Router()

router.post('/login', authRateLimiterMiddleware, validateBody(LoginBodySchema), AuthController.login)
router.post('/register', authRateLimiterMiddleware, validateBody(RegisterBodySchema), AuthController.register)
router.post(
  '/logout',
  AuthMiddleware.authenticateRefreshToken,
  validateBody(RefreshTokenBodySchema),
  AuthController.logout
)
router.post(
  '/refresh-token',
  AuthMiddleware.authenticateRefreshToken,
  validateBody(RefreshTokenBodySchema),
  AuthController.refreshToken
)

router.get('/google', authRateLimiterMiddleware, AuthController.getGoogleRedirectUrl)
router.post(
  '/google/callback',
  authRateLimiterMiddleware,
  validateBody(GoogleCallbackBodySchema),
  AuthController.verifyGoogleCallback
)

export default router
