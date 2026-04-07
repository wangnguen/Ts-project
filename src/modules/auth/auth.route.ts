import { authRateLimiterMiddleware, validateBody } from '@common/middlewares'
import AuthController from '@modules/auth/auth.controller'
import AuthMiddleware from '@common/middlewares/auth.middleware'
import { Router } from 'express'
import { LoginBodySchema, RegisterBodySchema } from '@modules/auth/dto'

const router = Router()

router.post('/login', authRateLimiterMiddleware, validateBody(LoginBodySchema), AuthController.login)
router.post('/register', authRateLimiterMiddleware, validateBody(RegisterBodySchema), AuthController.register)
router.post('/logout', AuthMiddleware.authenticateRefreshToken, AuthController.logout)
router.post('/refresh-token', AuthMiddleware.authenticateRefreshToken, AuthController.refreshToken)

export default router
