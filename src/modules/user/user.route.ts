import { Router } from 'express'
import UserController from './user.controller'
import { validateBody } from '@common/middlewares'
import { UpdateUserBodySchema, UpdateUserPasswordBodySchema } from './dto'

const router = Router()

router.get('/me', UserController.getUserInfo)
router.patch('/me', validateBody(UpdateUserBodySchema), UserController.updateUserInfo)
router.patch('/me/password', validateBody(UpdateUserPasswordBodySchema), UserController.updateUserPassword)
router.delete('/me', UserController.deleteUser)

export default router
