import { validateBody } from '@common/middlewares'
import AuthController from '@modules/auth/auth.controller'
import { LoginBodySchema, RegisterBodySchema } from '@modules/auth/auth.dto'
import { Router } from 'express'

const router = Router()

router.post('/login', validateBody(LoginBodySchema), AuthController.login)
router.post('/register', validateBody(RegisterBodySchema), AuthController.register)

router.post('/logout', AuthController.logout)
router.post('/refresh-token', AuthController.refreshToken)

export default router
