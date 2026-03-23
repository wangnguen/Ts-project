import { Router } from 'express'
import UserController from './user.controller'
import { CreateUserBodySchema, UpdateUserBodySchema, UuidParamSchema } from './user.dto'
import { validateBody, validateParam } from '@common/middlewares'

const router = Router()

router.get('/', UserController.getUsers)

router.post('/', validateBody(CreateUserBodySchema), UserController.createUser)

router.patch('/:id', validateParam(UuidParamSchema), validateBody(UpdateUserBodySchema), UserController.updateUser)

router.delete('/:id', validateParam(UuidParamSchema), UserController.deleteUser)

router.get('/:id', validateParam(UuidParamSchema), UserController.getUserById)

export default router
