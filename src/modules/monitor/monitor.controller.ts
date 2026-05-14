import { Request, Response } from 'express'

import { CreateMonitorBody } from '@modules/monitor/dto/'

import MonitorService from './monitor.service'

class MonitorController {
  static async createMonitor(req: Request, res: Response) {
    const body = req.body as CreateMonitorBody
    const userId = req.user!.id

    const monitor = await MonitorService.createMonitor(body, userId)

    return res.created({ monitor }, { message: 'Monitor created successfully' })
  }
}

export default MonitorController
