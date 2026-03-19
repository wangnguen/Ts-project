import { Router } from 'express'
import UserController from './user.controller'
import { CreateUserBodySchema, UpdateUserBodySchema } from './user.dto'
import { ValidationMiddleware } from '@common/middlewares'

const router = Router()

router.get('/', UserController.getUsers)

router.post('/', ValidationMiddleware.validate({ body: CreateUserBodySchema }), UserController.createUser)

router.patch('/:id', ValidationMiddleware.validate({ body: UpdateUserBodySchema }), UserController.updateUser)

router.delete('/:id', UserController.deleteUser)

router.get('/:id', UserController.getUserById)

export default router
