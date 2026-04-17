import { Router } from 'express'

import { AuthMiddleware, authRateLimiterMiddleware, validateBody } from '@common/middlewares'

import AuthController from './auth.controller'
import { LoginBodySchema, RegisterBodySchema } from './dto'

const router = Router()

router.post('/login', authRateLimiterMiddleware, validateBody(LoginBodySchema), AuthController.login)
router.post('/register', authRateLimiterMiddleware, validateBody(RegisterBodySchema), AuthController.register)
router.post('/logout', AuthMiddleware.authenticateRefreshToken, AuthController.logout)
router.post('/refresh-token', AuthMiddleware.authenticateRefreshToken, AuthController.refreshToken)

export default router
