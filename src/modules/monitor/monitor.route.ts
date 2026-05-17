import { Router } from 'express'

import { validateBody, validateQuery } from '@common/middlewares'

import { CreateMonitorBodySchema, ListMonitorsQuerySchema, UpdateMonitorBodySchema } from './dto'
import MonitorController from './monitor.controller'

const router = Router()

router.get('/', validateQuery(ListMonitorsQuerySchema), MonitorController.getMonitors)
router.get('/:id', MonitorController.getMonitorById)
router.post('/', validateBody(CreateMonitorBodySchema), MonitorController.createMonitor)
router.patch('/:id', validateBody(UpdateMonitorBodySchema), MonitorController.updateMonitor)
router.delete('/:id', MonitorController.deleteMonitor)
router.patch('/:id/pause', MonitorController.pauseMonitor)
router.patch('/:id/start', MonitorController.startMonitor)

export default router
