import { Router } from 'express'

import { validateBody } from '@common/middlewares'

import { CreateMonitorBodySchema } from './dto'
import MonitorController from './monitor.controller'

const router = Router()

router.post('/', validateBody(CreateMonitorBodySchema), MonitorController.createMonitor)

export default router
