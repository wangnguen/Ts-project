import { Request, Response } from 'express'

import { CreateMonitorBody, ListMonitorsQuerySchema, UpdateMonitorBody } from '@modules/monitor/dto'

import MonitorService from './monitor.service'

class MonitorController {
  static async getMonitors(req: Request, res: Response) {
    const query = ListMonitorsQuerySchema.parse(req.query)
    const userId = req.user!.id
    const monitors = await MonitorService.getMonitors(userId, query)
    return res.ok({ monitors }, { message: 'Monitors retrieved successfully' })
  }

  static async getMonitorById(req: Request, res: Response) {
    const id = req.params.id as string
    const userId = req.user!.id
    const monitor = await MonitorService.getMonitorById(id, userId)
    return res.ok({ monitor }, { message: 'Monitor retrieved successfully' })
  }

  static async createMonitor(req: Request, res: Response) {
    const body = req.body as CreateMonitorBody
    const userId = req.user!.id
    const monitor = await MonitorService.createMonitor(body, userId)
    return res.created({ monitor }, { message: 'Monitor created successfully' })
  }

  static async updateMonitor(req: Request, res: Response) {
    const id = req.params.id as string
    const userId = req.user!.id
    const body = req.body as UpdateMonitorBody
    const monitor = await MonitorService.updateMonitor(id, userId, body)
    return res.ok({ monitor }, { message: 'Monitor updated successfully' })
  }

  static async deleteMonitor(req: Request, res: Response) {
    const id = req.params.id as string
    const userId = req.user!.id
    await MonitorService.deleteMonitor(id, userId)
    return res.ok(null, { message: 'Monitor deleted successfully' })
  }

  static async pauseMonitor(req: Request, res: Response) {
    const id = req.params.id as string
    const userId = req.user!.id
    await MonitorService.pauseMonitor(id, userId)
    return res.ok(null, { message: 'Monitor paused successfully' })
  }

  static async startMonitor(req: Request, res: Response) {
    const id = req.params.id as string
    const userId = req.user!.id
    await MonitorService.startMonitor(id, userId)
    return res.ok(null, { message: 'Monitor started successfully' })
  }
}

export default MonitorController
