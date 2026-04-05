import { validateBody } from '@common/middlewares'
import AuthController from '@modules/auth/auth.controller'
import { LoginBodySchema, RegisterBodySchema } from '@modules/auth/auth.dto'
import AuthMiddleware from '@modules/auth/auth.middleware'
import { Router } from 'express'

const router = Router()

router.post('/login', validateBody(LoginBodySchema), AuthController.login)
router.post('/register', validateBody(RegisterBodySchema), AuthController.register)

router.post('/logout', AuthMiddleware.authenticateRefreshToken, AuthController.logout)
router.post('/refresh-token', AuthMiddleware.authenticateRefreshToken, AuthController.refreshToken)

export default router
