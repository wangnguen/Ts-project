import { MonitorStatus } from '@common/constants/monitor.constant'
import { ForbiddenError, NotFoundError } from '@common/errors'
import { Paginated } from '@common/types'

import { CreateMonitorBody, ListMonitorsQuery, UpdateMonitorBody } from '@modules/monitor/dto'
import MonitorRepository from '@modules/monitor/monitor.repository'

import { Monitor } from '@entities/monitor.entity'

class MonitorService {
  static async getMonitors(userId: string, query: ListMonitorsQuery): Promise<Paginated<Monitor>> {
    const [entries, total_count] = await MonitorRepository.findAllByUserId(userId, query.limit, query.offset)
    return { entries, limit: query.limit, offset: query.offset, total_count }
  }

  static async getMonitorById(id: string, userId: string) {
    const monitor = await MonitorRepository.findById(id)
    if (!monitor) throw new NotFoundError('Monitor not found')
    if (monitor.userId !== userId) throw new ForbiddenError('Access denied')
    return monitor
  }

  static async createMonitor(dto: CreateMonitorBody, userId: string) {
    return MonitorRepository.createMonitor({ ...dto, userId })
  }

  static async updateMonitor(id: string, userId: string, dto: UpdateMonitorBody) {
    await this.getMonitorById(id, userId)
    await MonitorRepository.updateMonitor(id, dto)
    return MonitorRepository.findById(id)
  }

  static async deleteMonitor(id: string, userId: string) {
    await this.getMonitorById(id, userId)
    await MonitorRepository.softDeleteMonitor(id)
  }

  static async pauseMonitor(id: string, userId: string) {
    await this.getMonitorById(id, userId)
    await MonitorRepository.updateMonitor(id, { isActive: false, currentStatus: MonitorStatus.PENDING })
    return MonitorRepository.findById(id)
  }

  static async startMonitor(id: string, userId: string) {
    await this.getMonitorById(id, userId)
    await MonitorRepository.updateMonitor(id, { isActive: true })
    return MonitorRepository.findById(id)
  }
}

export default MonitorService
